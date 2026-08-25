<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Auth\UseCases\ChangePassword;
use App\Application\Auth\UseCases\UpdateProfile;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Auth\ChangePasswordRequest;
use App\Presentation\Http\Requests\Auth\UpdateProfileRequest;
use App\Presentation\Http\Resources\UserResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;

final class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request, UpdateProfile $useCase): JsonResponse
    {
        $data = $request->safe()->except('avatar');

        $user = $useCase->execute(
            $this->user($request),
            $data,
            $request->file('avatar'),
        );

        return ApiResponse::success(new UserResource($user), 'Profile updated.');
    }

    public function changePassword(ChangePasswordRequest $request, ChangePassword $useCase): JsonResponse
    {
        $useCase->execute(
            $this->user($request),
            $request->string('current_password')->toString(),
            $request->string('password')->toString(),
        );

        return ApiResponse::success(null, 'Password changed. Other devices have been signed out.');
    }
}
