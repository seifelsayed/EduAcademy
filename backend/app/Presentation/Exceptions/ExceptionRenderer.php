<?php

declare(strict_types=1);

namespace App\Presentation\Exceptions;

use App\Domain\Shared\Exceptions\DomainException;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

/**
 * Translates exceptions from every layer into the ApiResponse error envelope.
 * Domain rule violations carry their own code and status; everything else is
 * mapped here so no framework detail leaks to clients.
 */
final class ExceptionRenderer
{
    public function render(Throwable $e, Request $request): ?JsonResponse
    {
        if (! $request->is('api/*') && ! $request->expectsJson()) {
            return null;
        }

        return match (true) {
            $e instanceof DomainException => ApiResponse::error(
                $e->getMessage(),
                $e->errorCode(),
                $e->statusCode(),
                $e->context(),
            ),

            $e instanceof ValidationException => ApiResponse::error(
                'The given data was invalid.',
                'validation_failed',
                422,
                [],
                $e->errors(),
            ),

            $e instanceof AuthenticationException => ApiResponse::error(
                'Authentication required.',
                'unauthenticated',
                401,
            ),

            $e instanceof AuthorizationException => ApiResponse::error(
                $e->getMessage() !== '' ? $e->getMessage() : 'This action is unauthorized.',
                'forbidden',
                403,
            ),

            $e instanceof ModelNotFoundException => ApiResponse::error(
                'The requested resource was not found.',
                'not_found',
                404,
            ),

            $e instanceof NotFoundHttpException => ApiResponse::error(
                'The requested endpoint was not found.',
                'endpoint_not_found',
                404,
            ),

            $e instanceof TooManyRequestsHttpException => ApiResponse::error(
                'Too many requests. Please slow down.',
                'rate_limited',
                429,
                array_filter(['retry_after' => $e->getHeaders()['Retry-After'] ?? null]),
            ),

            $e instanceof HttpExceptionInterface => ApiResponse::error(
                $e->getMessage() !== '' ? $e->getMessage() : 'Request failed.',
                'http_error',
                $e->getStatusCode(),
            ),

            default => $this->renderUnexpected($e),
        };
    }

    private function renderUnexpected(Throwable $e): JsonResponse
    {
        // Stack traces are for the log, not for API consumers — unless the
        // developer explicitly turned debug mode on.
        $context = config('app.debug') === true
            ? [
                'exception' => $e::class,
                'detail' => $e->getMessage(),
                'file' => $e->getFile().':'.$e->getLine(),
            ]
            : [];

        return ApiResponse::error(
            'Something went wrong on our end.',
            'server_error',
            500,
            $context,
        );
    }
}
