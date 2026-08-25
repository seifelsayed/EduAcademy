<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Platform business rules
    |--------------------------------------------------------------------------
    |
    | Values the Application/Domain layers depend on. Keeping them here rather
    | than as magic numbers inside use-cases keeps business policy explicit
    | and configurable per environment.
    |
    */

    'currency' => env('PLATFORM_CURRENCY', 'USD'),

    // Marketplace commission taken from each paid enrolment (0.0 - 1.0).
    'commission_rate' => (float) env('PLATFORM_COMMISSION_RATE', 0.20),

    // Minimum quiz score (percent) required to pass a graded quiz.
    'quiz_pass_threshold' => (int) env('QUIZ_PASS_THRESHOLD', 60),

    // Minimum overall progress (percent) required to earn a certificate.
    'certificate_pass_threshold' => (int) env('CERTIFICATE_PASS_THRESHOLD', 70),

    // Progress (percent) at which an enrolment is marked completed.
    'course_completion_threshold' => (int) env('COURSE_COMPLETION_THRESHOLD', 100),

    'pagination' => [
        'per_page' => 15,
        'max_per_page' => 100,
    ],

    'uploads' => [
        'disk' => env('FILESYSTEM_DISK', 'public'),
        'max_image_kb' => 4096,
        'max_attachment_kb' => 20480,
    ],
];
