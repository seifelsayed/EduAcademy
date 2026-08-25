<?php

declare(strict_types=1);

namespace App\Presentation\Http\Responses;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * One envelope for every API response, so the frontend can parse results and
 * failures without special-casing each endpoint.
 *
 * Success: { "data": ..., "message": ?string, "meta": ?object }
 * Failure: { "message": string, "error": { "code": string, ... }, "errors": ?object }
 */
final class ApiResponse
{
    public static function success(
        mixed $data = null,
        ?string $message = null,
        int $status = 200,
        array $meta = [],
    ): JsonResponse {
        $payload = ['data' => self::normalise($data)];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    public static function created(mixed $data = null, ?string $message = null): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  array<string, array<int, string>>|null  $errors
     */
    public static function error(
        string $message,
        string $code = 'error',
        int $status = 400,
        array $context = [],
        ?array $errors = null,
    ): JsonResponse {
        $payload = [
            'message' => $message,
            'error' => ['code' => $code, ...$context],
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    /**
     * Wraps a paginator, moving Laravel's pagination keys into `meta` and
     * dropping the HTML-oriented `links` block.
     *
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @param  class-string<JsonResource>|null  $resource
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        ?string $resource = null,
        array $extraMeta = [],
    ): JsonResponse {
        $items = $resource !== null
            ? $resource::collection($paginator->getCollection())->resolve()
            : $paginator->getCollection()->toArray();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                ...$extraMeta,
            ],
        ]);
    }

    private static function normalise(mixed $data): mixed
    {
        if ($data instanceof JsonResource || $data instanceof ResourceCollection) {
            return $data->resolve();
        }

        return $data;
    }
}
