<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\User\Enums\UserRole;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_register_as_a_student(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jamie Lee',
            'email' => 'jamie@example.com',
            'password' => 'secret-pass-1',
            'password_confirmation' => 'secret-pass-1',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.email', 'jamie@example.com')
            ->assertJsonPath('data.user.role', UserRole::Student->value)
            ->assertJsonStructure(['data' => ['token']]);

        $this->assertDatabaseHas('users', ['email' => 'jamie@example.com']);
    }

    public function test_a_visitor_cannot_register_as_an_admin(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'secret-pass-1',
            'password_confirmation' => 'secret-pass-1',
            'role' => UserRole::Admin->value,
        ])->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'sneaky@example.com']);
    }

    public function test_registration_rejects_a_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Someone',
            'email' => 'taken@example.com',
            'password' => 'secret-pass-1',
            'password_confirmation' => 'secret-pass-1',
        ])->assertStatus(409)
            ->assertJsonPath('error.code', 'email_taken');
    }

    public function test_a_user_can_sign_in_and_receive_a_token(): void
    {
        User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'password',
        ])->assertOk()
            ->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_wrong_credentials_are_rejected_with_a_generic_message(): void
    {
        User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(401)
            ->assertJsonPath('error.code', 'invalid_credentials');
    }

    public function test_a_suspended_account_cannot_sign_in(): void
    {
        User::factory()->suspended()->create(['email' => 'blocked@example.com']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'blocked@example.com',
            'password' => 'password',
        ])->assertStatus(403)
            ->assertJsonPath('error.code', 'account_inactive');
    }

    public function test_the_me_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonPath('error.code', 'unauthenticated');
    }

    public function test_an_authenticated_user_can_read_their_own_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }
}
