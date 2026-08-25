<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Auth\DTOs\LoginData;
use App\Application\Auth\DTOs\RegisterUserData;
use App\Application\Auth\UseCases\LoginUser;
use App\Application\Auth\UseCases\LogoutUser;
use App\Application\Auth\UseCases\RegisterUser;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Auth\LoginRequest;
use App\Presentation\Http\Requests\Auth\RegisterRequest;
use App\Presentation\Http\Resources\UserResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AuthController extends Controller
{
    public function register(RegisterRequest $request, RegisterUser $useCase): JsonResponse
    {
        $result = $useCase->execute(RegisterUserData::fromArray($request->validated()));

        return ApiResponse::created([
            'user' => new UserResource($result['user'], exposePrivate: true),
            'token' => $result['token'],
        ], 'Welcome aboard!');
    }

    public function login(LoginRequest $request, LoginUser $useCase): JsonResponse
    {
        $result = $useCase->execute(LoginData::fromArray($request->validated()));

        return ApiResponse::success([
            'user' => new UserResource($result['user'], exposePrivate: true),
            'token' => $result['token'],
        ], 'Signed in.');
    }

    public function logout(Request $request, LogoutUser $useCase): JsonResponse
    {
        $useCase->execute($this->user($request), $request->boolean('all_devices'));

        return ApiResponse::success(null, 'Signed out.');
    }

    /**
     * The session bootstrap call the SPA makes on load.
     */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(new UserResource($this->user($request)));
    }
}
