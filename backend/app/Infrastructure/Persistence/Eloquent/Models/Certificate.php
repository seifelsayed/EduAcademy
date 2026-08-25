<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $enrollment_id
 * @property string $serial
 * @property float $final_score
 */
class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'user_id',
        'course_id',
        'serial',
        'final_score',
        'recipient_name',
        'course_title',
        'instructor_name',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'final_score' => 'float',
            'issued_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'serial';
    }

    /** @return BelongsTo<Enrollment, $this> */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Course, $this> */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
