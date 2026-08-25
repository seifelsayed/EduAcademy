<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Engagement\UseCases\IssueCertificate;
use App\Domain\Engagement\Contracts\CertificateRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Resources\CertificateResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CertificateController extends Controller
{
    public function __construct(
        private readonly CertificateRepositoryInterface $certificates,
        private readonly EnrollmentRepositoryInterface $enrollments,
        private readonly IssueCertificate $issue,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return ApiResponse::success(
            CertificateResource::collection($this->certificates->forStudent($this->user($request)))
        );
    }

    /**
     * Claims the certificate for a completed course.
     */
    public function store(Request $request, Course $course): JsonResponse
    {
        $enrollment = $this->enrollments->findFor($this->user($request), $course);

        if ($enrollment === null) {
            throw BusinessRuleViolation::forbidden('You are not enrolled in this course.', 'not_enrolled');
        }

        $certificate = $this->issue->execute($enrollment);

        return ApiResponse::created(
            new CertificateResource($certificate->load('course')),
            'Certificate issued. Congratulations!',
        );
    }

    /**
     * Public verification by serial — no authentication required.
     */
    public function verify(string $serial): JsonResponse
    {
        $certificate = $this->issue->verify($serial);

        if ($certificate === null) {
            return ApiResponse::error(
                'No certificate matches that serial.',
                'certificate_not_found',
                404,
            );
        }

        return ApiResponse::success(new CertificateResource($certificate), 'Certificate is valid.');
    }
}
