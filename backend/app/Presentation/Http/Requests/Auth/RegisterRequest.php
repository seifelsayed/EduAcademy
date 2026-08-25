<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Auth;

use App\Domain\User\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

final class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'role' => ['sometimes', Rule::in(UserRole::selfAssignable())],
            'device_name' => ['sometimes', 'string', 'max:120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.in' => 'You can register as a student or an instructor.',
        ];
    }
}
