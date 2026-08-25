<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Dashboard\UseCases\GetAdminDashboard;
use App\Application\Dashboard\UseCases\GetInstructorDashboard;
use App\Application\Dashboard\UseCases\GetStudentDashboard;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Resources\CertificateResource;
use App\Presentation\Http\Resources\CourseResource;
use App\Presentation\Http\Resources\EnrollmentResource;
use App\Presentation\Http\Resources\ReviewResource;
use App\Presentation\Http\Resources\UserResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DashboardController extends Controller
{
    public function student(Request $request, GetStudentDashboard $useCase): JsonResponse
    {
        $data = $useCase->execute($this->user($request));

        return ApiResponse::success([
            'stats' => $data['stats'],
            'continue_learning' => EnrollmentResource::collection($data['continue_learning']),
            'recent_certificates' => CertificateResource::collection($data['recent_certificates']),
        ]);
    }

    public function instructor(Request $request, GetInstructorDashboard $useCase): JsonResponse
    {
        $this->authorize('access-instructor');

        $data = $useCase->execute($this->user($request), $request->integer('days', 30));

        return ApiResponse::success([
            'stats' => $data['stats'],
            'charts' => $data['charts'],
            'top_courses' => CourseResource::collection($data['top_courses']),
            'recent_reviews' => ReviewResource::collection($data['recent_reviews']),
        ]);
    }

    public function admin(Request $request, GetAdminDashboard $useCase): JsonResponse
    {
        $this->authorize('access-admin');

        $data = $useCase->execute($request->integer('days', 30));

        return ApiResponse::success([
            'stats' => $data['stats'],
            'charts' => $data['charts'],
            'top_instructors' => UserResource::collection($data['top_instructors']),
            'featured_courses' => CourseResource::collection($data['featured_courses']),
        ]);
    }
}
