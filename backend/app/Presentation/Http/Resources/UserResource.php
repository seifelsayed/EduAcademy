<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
final class UserResource extends JsonResource
{
    private bool $exposePrivate;

    public function __construct(mixed $resource, bool $exposePrivate = false)
    {
        parent::__construct($resource);
        $this->exposePrivate = $exposePrivate;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $isSelf = $this->exposePrivate || ($viewer !== null && $viewer->id === $this->id);
        $isAdmin = $viewer?->isAdmin() === true;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role?->value ?? 'student',
            'avatar_url' => $this->avatarUrl(),
            'headline' => $this->headline,
            'bio' => $this->bio,
            'website' => $this->website,
            'social_links' => (object) ($this->social_links ?? []),

            // Contact details and account state are private.
            'email' => $this->when($isSelf || $isAdmin, $this->email),
            'email_verified' => $this->when($isSelf || $isAdmin, fn () => $this->email_verified_at !== null),
            'status' => $this->when($isSelf || $isAdmin, fn () => $this->status?->value ?? 'active'),
            'locale' => $this->when($isSelf, $this->locale),
            'timezone' => $this->when($isSelf, $this->timezone),
            'last_login_at' => $this->when($isSelf || $isAdmin, fn () => $this->last_login_at?->toIso8601String()),

            'courses_count' => $this->whenCounted('courses'),
            'enrollments_count' => $this->whenCounted('enrollments'),
            'students_total' => $this->when(isset($this->students_total), fn () => (int) $this->students_total),

            'created_at' => $this->when(isset($this->created_at), fn () => $this->created_at?->toIso8601String()),

        ];
    }
}
