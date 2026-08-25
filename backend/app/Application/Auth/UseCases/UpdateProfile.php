<?php

declare(strict_types=1);

namespace App\Application\Auth\UseCases;

use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Domain\User\Contracts\UserRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final readonly class UpdateProfile
{
    public function __construct(
        private UserRepositoryInterface $users,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data, ?UploadedFile $avatar = null): User
    {
        if (isset($data['email'])) {
            $email = mb_strtolower(trim((string) $data['email']));

            if ($this->users->emailExists($email, $user->id)) {
                throw BusinessRuleViolation::conflict(
                    'An account with that email already exists.',
                    'email_taken',
                );
            }

            $data['email'] = $email;

            // Changing the address invalidates the previous verification.
            if ($email !== $user->email) {
                $data['email_verified_at'] = null;
            }
        }

        if ($avatar !== null) {
            $data['avatar_path'] = $this->storeAvatar($user, $avatar);
        }

        return $this->users->update($user, $data);
    }

    private function storeAvatar(User $user, UploadedFile $avatar): string
    {
        $disk = Storage::disk((string) config('platform.uploads.disk'));

        if ($user->avatar_path !== null) {
            $disk->delete($user->avatar_path);
        }

        return $avatar->store('avatars', (string) config('platform.uploads.disk'));
    }
}
