<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1\Admin;

use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Domain\User\Contracts\UserRepositoryInterface;
use App\Domain\User\Enums\UserRole;
use App\Domain\User\Enums\UserStatus;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Resources\UserResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class UserController extends Controller
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('access-admin');

        $paginator = $this->users->search($request->only(['search', 'role', 'status']), $this->perPage($request));

        return ApiResponse::paginated($paginator, UserResource::class, [
            'statistics' => $this->users->statistics(),
        ]);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $this->authorize('access-admin');

        return ApiResponse::success(
            new UserResource($user->loadCount(['courses', 'enrollments']))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('access-admin');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(UserRole::values())],
            'status' => ['required', Rule::in(UserStatus::values())],
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ]);

        $validated['password'] = bcrypt($validated['password']);

        $user = $this->users->create($validated);

        return ApiResponse::created(
            new UserResource($user),
            'User created.',
        );
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->authorize('access-admin');

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'role' => ['sometimes', Rule::in(UserRole::values())],
            'status' => ['sometimes', Rule::in(UserStatus::values())],
            'headline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $this->assertNotSelfDemotion($request, $user, $validated);

        return ApiResponse::success(
            new UserResource($this->users->update($user, $validated)),
            'User updated.',
        );
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('access-admin');

        if ($user->id === $this->user($request)->id) {
            throw BusinessRuleViolation::forbidden('You cannot delete your own account here.', 'self_delete');
        }

        $this->users->delete($user);

        return ApiResponse::success(null, 'User deleted.');
    }

    /**
     * Guards against an admin locking themselves out of the admin area.
     *
     * @param  array<string, mixed>  $validated
     */
    private function assertNotSelfDemotion(Request $request, User $user, array $validated): void
    {
        if ($user->id !== $this->user($request)->id) {
            return;
        }

        $losingAdmin = isset($validated['role']) && $validated['role'] !== UserRole::Admin->value;
        $suspendingSelf = isset($validated['status']) && $validated['status'] !== UserStatus::Active->value;

        if ($losingAdmin || $suspendingSelf) {
            throw BusinessRuleViolation::forbidden(
                'You cannot change your own role or status.',
                'self_demotion',
            );
        }
    }
}
