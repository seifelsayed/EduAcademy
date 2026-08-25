<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Assessment\Enums\QuestionType;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\User\Enums\UserRole;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Category;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Question;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

final class CourseSeeder extends Seeder
{
    public function __construct(
        private readonly CourseRepositoryInterface $courses,
    ) {}

    public function run(): void
    {
        $students = User::query()->where('role', UserRole::Student->value)->get();
        $catalog = $this->getCourseCatalog();

        foreach ($catalog as $courseData) {
            $category = Category::query()->where('slug', $courseData['category_slug'])->first();
            $instructor = User::query()->where('email', $courseData['instructor_email'])->first()
                ?? User::query()->where('role', UserRole::Instructor->value)->first();

            if (! $category || ! $instructor) {
                continue;
            }

            $course = Course::query()->updateOrCreate(
                ['slug' => $courseData['slug']],
                [
                    'instructor_id' => $instructor->id,
                    'category_id' => $category->id,
                    'title' => $courseData['title'],
                    'subtitle' => $courseData['subtitle'],
                    'description' => $courseData['description'],
                    'level' => $courseData['level'],
                    'language' => 'Arabic',
                    'status' => CourseStatus::Published->value,
                    'price_cents' => $courseData['price_cents'],
                    'discount_price_cents' => $courseData['discount_price_cents'],
                    'currency' => 'USD',
                    'requirements' => $courseData['requirements'],
                    'outcomes' => $courseData['outcomes'],
                    'target_audience' => $courseData['target_audience'],
                    'is_featured' => $courseData['is_featured'],
                    'published_at' => now()->subDays(fake()->numberBetween(10, 180)),
                ],
            );

            // Seed clean sections and lessons
            $this->seedCurriculum($course, $courseData['sections']);

            // Seed realistic Arabic student reviews
            $this->seedCourseReviews($course, $students);

            // Recompute dynamic aggregates
            $this->courses->refreshAggregates($course);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $sectionsData
     */
    private function seedCurriculum(Course $course, array $sectionsData): void
    {
        $course->sections()->delete();

        foreach ($sectionsData as $sIndex => $secData) {
            $section = Section::query()->create([
                'course_id' => $course->id,
                'title' => $secData['title'],
                'position' => $sIndex + 1,
            ]);

            foreach ($secData['lessons'] as $lIndex => $lessonData) {
                $lesson = Lesson::query()->create([
                    'section_id' => $section->id,
                    'course_id' => $course->id,
                    'title' => $lessonData['title'],
                    'slug' => Str::slug($lessonData['title']).'-'.Str::lower(Str::random(4)),
                    'type' => $lessonData['type'],
                    'duration_minutes' => $lessonData['duration_minutes'],
                    'position' => $lIndex + 1,
                    'is_preview' => $lessonData['is_preview'],
                    'is_published' => true,
                    'content' => $lessonData['content'] ?? null,
                    'video_url' => $lessonData['type'] === 'video' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
                    'video_provider' => $lessonData['type'] === 'video' ? 'youtube' : null,
                    'video_duration_seconds' => $lessonData['type'] === 'video' ? $lessonData['duration_minutes'] * 60 : null,
                ]);

                if ($lessonData['type'] === 'quiz' && isset($lessonData['quiz'])) {
                    $this->createQuiz($lesson, $lessonData['quiz']);
                }

                if ($lessonData['type'] === 'assignment' && isset($lessonData['assignment'])) {
                    $this->createAssignment($lesson, $lessonData['assignment']);
                }
            }
        }
    }

    /**
     * @param  array{title: string, questions: array<int, array{prompt: string, explanation: string, options: array<int, array{text: string, is_correct: bool}>}>}  $quizData
     */
    private function createQuiz(Lesson $lesson, array $quizData): void
    {
        $quiz = Quiz::query()->create([
            'lesson_id' => $lesson->id,
            'title' => $quizData['title'],
            'description' => 'اختبار قصير ومباشر لقياس مدى استيعاب المفاهيم المشروحة في هذه الوحدة.',
            'time_limit_minutes' => 15,
            'passing_score' => 70,
            'max_attempts' => 3,
            'shuffle_questions' => false,
            'show_correct_answers' => true,
        ]);

        foreach ($quizData['questions'] as $qIndex => $q) {
            $question = Question::query()->create([
                'quiz_id' => $quiz->id,
                'type' => QuestionType::SingleChoice->value,
                'prompt' => $q['prompt'],
                'explanation' => $q['explanation'],
                'points' => 1,
                'position' => $qIndex + 1,
            ]);

            foreach ($q['options'] as $oIndex => $opt) {
                $question->options()->create([
                    'text' => $opt['text'],
                    'is_correct' => $opt['is_correct'],
                    'position' => $oIndex + 1,
                ]);
            }
        }
    }

    /**
     * @param  array{title: string, instructions: string}  $assignData
     */
    private function createAssignment(Lesson $lesson, array $assignData): void
    {
        Assignment::query()->create([
            'lesson_id' => $lesson->id,
            'title' => $assignData['title'],
            'instructions' => $assignData['instructions'],
            'max_points' => 100,
            'due_at' => now()->addWeeks(3),
            'allow_late_submissions' => true,
        ]);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, User>  $students
     */
    private function seedCourseReviews(Course $course, $students): void
    {
        if ($students->isEmpty()) {
            return;
        }

        $reviews = [
            [
                'rating' => 5,
                'title' => 'دورة ممتازة وشرح في غاية الوضوح',
                'comment' => 'المحتوى منظم جداً والتمارين العملية ساعدتني كثيراً في فهم المفاهيم وتطبيقها في عملي اليومي. شكراً جزيلاً للمدرب.',
            ],
            [
                'rating' => 5,
                'title' => 'أفضل محتوى عربي تقني درسته حتى الآن',
                'comment' => 'الشرح عميق وسلس بدون حشو غير مفيد، والمشروع النهائي للمسار كان إضافة قوية لمعرض أعمالي.',
            ],
            [
                'rating' => 4,
                'title' => 'محتوى قيّم وثرِي بالمعلومات',
                'comment' => 'استفدت جداً من التطبيقات العملية وخطوات الشرح المنطقية. أنصح بشدة بهذا المسار لجميع المهتمين بالمجال.',
            ],
            [
                'rating' => 5,
                'title' => 'تجربة تعليمية ملهمة ومجهزة لسوق العمل',
                'comment' => 'الدورة تغطي أحدث الممارسات والمعايير العالمية بأسلوب عربي احترافي وممتع.',
            ],
        ];

        $reviewers = $students->random(min(count($students), 4));

        foreach ($reviewers as $idx => $student) {
            $reviewItem = $reviews[$idx % count($reviews)];
            $course->reviews()->create([
                'user_id' => $student->id,
                'rating' => $reviewItem['rating'],
                'title' => $reviewItem['title'],
                'comment' => $reviewItem['comment'],
                'is_approved' => true,
            ]);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function getCourseCatalog(): array
    {
        return [
            // 1. Web & Fullstack Development
            [
                'title' => 'تطوير تطبيقات الويب المتكاملة باستخدام React و Node.js',
                'slug' => 'fullstack-web-development-react-nodejs',
                'category_slug' => 'web-development',
                'instructor_email' => 'sarah.mansour@education.test',
                'subtitle' => 'احترف بناء تطبيقات الويب الحديثة من الصفر وحتى نشر تطبيق إنتاجي متكامل مع قاعدة بيانات وواجهة برمجة API.',
                'description' => <<<'MD'
تعلّم كيفية بناء تطبيقات ويب عصرية وشاملة (Full-Stack) تجمع بين قوة وسرعة مكتبة React.js في بناء واجهات المستخدم التفاعلية، وكفاءة وقابلية توسع بيئة Node.js و Express في الخوادم وقواعد البيانات.

### ماذا ستتعلم في هذا المسار؟
- فهم عميق لمعمارية تطبيقات الويب الحديثة والتواصل بين العميل والخادم.
- إتقان React Hooks و Custom Hooks وإدارة الحالة المتقدمة.
- بناء خوادم RESTful APIs آمنة باستخدام Node.js و Express مع التوثيق عبر JWT.
- التعامل مع قواعد بيانات MongoDB و PostgreSQL ونمذجة البيانات بكفاءة.
- التعامل مع المدفوعات ورفع الملفات وتأمين التطبيق ضد الثغرات الشائعة.
- تجهيز التطبيق للإنتاج ونشره على منصات سحابية مثل Vercel و Render.

### الفئة المستهدفة:
- مطورو الواجهات الذين يرغبون في الانتقال إلى مستوى Full-Stack.
- المبتدئون الذين يمتلكون أساسيات JavaScript ويريدون بناء مشاريع تجارية حقيقية.
- الطلاب الراغبون في إعداد ملف أعمال (Portfolio) قوي للتقديم على الوظائف.
MD,
                'level' => 'intermediate',
                'price_cents' => 6999,
                'discount_price_cents' => 4999,
                'is_featured' => true,
                'requirements' => [
                    'معرفة جيدة بلغة JavaScript وأساسيات ES6+',
                    'إلمام بأساسيات HTML5 و CSS3',
                    'جهاز حاسوب مثبت عليه Node.js ومحرر أكواد مثل VS Code',
                ],
                'outcomes' => [
                    'بناء تطبيقات React تفاعلية سريعة وقابلة للصيانة',
                    'إنشاء وتأمين واجهات RESTful APIs متقدمة باستخدام Node.js',
                    'ربط وإدارة قواعد البيانات وإجراء عمليات CRUD مع المصادقة',
                    'نشر التطبيق الكامل على السحابة وتجهيزه لسوق العمل الفعلي',
                ],
                'target_audience' => [
                    'مطوروا الواجهات الأمامية الساعون لإتقان الـ Backend',
                    'مبرمجو JavaScript المهتمون بالبناء الكامل للأنظمة',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: أساسيات React ومفاهيم المكونات (Components)',
                        'lessons' => [
                            [
                                'title' => 'مقدمة إلى React وتهيئة بيئة العمل الحديثة عبر Vite',
                                'type' => 'video',
                                'duration_minutes' => 14,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'هيكلية المكونات (Components) والـ JSX وكتابة كود نظيف',
                                'type' => 'video',
                                'duration_minutes' => 18,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'دليل شامل: فهم دورة حياة المكونات والتعامل مع الـ Props و State',
                                'type' => 'article',
                                'duration_minutes' => 12,
                                'is_preview' => false,
                                'content' => <<<'MD'
### فهم حالة المكونات (State) في React

تعتبر الـ **State** القلب النابض لأي مكون في React؛ فهي تمثل البيانات المتغيرة التي يعتمد عليها شكل الواجهة وسلوكها.

```jsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-card">
      <h2>العداد الحالي: {count}</h2>
      <button onClick={() => setCount(prev => prev + 1)}>زيادة +</button>
    </div>
  );
}
```

#### نقاط أساسية يجب تذكرها:
- لا تقم بتعديل الحالة مباشرة (Immutable State Updates).
- استخدم دالة التحديث إذا كانت القيمة الجديدة تعتمد على القيمة السابقة.
- يساعد فصل المكونات الذكية (Smart Containers) عن المكونات البصرية (Presentational) في الحفاظ على قابلية اختبار الكود.
MD,
                            ],
                            [
                                'title' => 'اختبار فهم أساسيات React والتعامل مع الأحداث',
                                'type' => 'quiz',
                                'duration_minutes' => 10,
                                'is_preview' => false,
                                'content' => null,
                                'quiz' => [
                                    'title' => 'اختبار المفاهيم الأساسية في React',
                                    'questions' => [
                                        [
                                            'prompt' => 'ما هي الطريقة الصحيحة لتحديث مصفوفة في الـ State دون تعديل الأصل؟',
                                            'explanation' => 'يجب استخدام Spread operator أو دالة تعيد مصفوفة جديدة مثل concat أو filter لضمان Immutability.',
                                            'options' => [
                                                ['text' => 'استخدام Spread Operator مثل [...prev, newItem]', 'is_correct' => true],
                                                ['text' => 'استخدام دالة array.push مباشرة', 'is_correct' => false],
                                                ['text' => 'تعديل العنصر عبر array[0] = value', 'is_correct' => false],
                                                ['text' => 'حذف العنصر باستخدام delete array[0]', 'is_correct' => false],
                                            ],
                                        ],
                                        [
                                            'prompt' => 'لماذا يُفضل استخدام Vite بدلاً من Create React App في المشاريع الحديثة؟',
                                            'explanation' => 'يعتمد Vite على Native ES Modules و Rollup/Esbuild مما يمنح سرعة فائقة في البناء والتطوير الساخن (HMR).',
                                            'options' => [
                                                ['text' => 'لأنه يوفر سرعة تشغيل وتطوير فائقة عبر HMR ومحرك Esbuild', 'is_correct' => true],
                                                ['text' => 'لأنه لا يحتاج إلى تنزيل حزم npm نهائياً', 'is_correct' => false],
                                                ['text' => 'لأنه يدعم لغة Python فقط', 'is_correct' => false],
                                                ['text' => 'لأنه لا يستخدم محرك جافاسكربت', 'is_correct' => false],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'title' => 'الوحدة الثانية: بناء الخادم وواجهات البرمجة بواسطة Node.js و Express',
                        'lessons' => [
                            [
                                'title' => 'إنشاء خادم Express وهيكلة المجلدات بنظام MVC',
                                'type' => 'video',
                                'duration_minutes' => 22,
                                'is_preview' => false,
                                'content' => null,
                            ],
                            [
                                'title' => 'بناء مسارات RESTful APIs ومعالجة الطلبات والاستجابات',
                                'type' => 'video',
                                'duration_minutes' => 20,
                                'is_preview' => false,
                                'content' => null,
                            ],
                            [
                                'title' => 'البرمجيات الوسيطة (Middlewares) والتحقق من صحة المدخلات عبر Zod',
                                'type' => 'article',
                                'duration_minutes' => 15,
                                'is_preview' => false,
                                'content' => <<<'MD'
### التحقق الآمن من مدخلات الـ API باستخدام Zod

يعد التحقق من صحة المدخلات خط الدفاع الأول لحماية خوادم الويب من البيانات غير الصالحة وهجمات الحقن.

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يتكون من 3 أحرف على الأقل'),
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(8, 'كلمة المرور يجب ألا تقل عن 8 خانات'),
});
```
MD,
                            ],
                            [
                                'title' => 'مشروع عملي: بناء نظام مصادقة كامل وتأمين الـ Endpoints عبر JWT',
                                'type' => 'assignment',
                                'duration_minutes' => 45,
                                'is_preview' => false,
                                'content' => null,
                                'assignment' => [
                                    'title' => 'مشروع الـ Authentication API الكامل',
                                    'instructions' => <<<'MD'
المطلوب منك في هذا المشروع العملي:
1. إنشاء مسار لتسجيل مستخدم جديد `/api/auth/register` مع تشفير كلمة المرور بواسطة bcrypt.
2. إنشاء مسار لتسجيل الدخول `/api/auth/login` وإصدار رمز JWT.
3. بناء Middleware للتحقق من التوكن وحماية المسارات الخاصة `/api/profile`.
4. تسليم الكود عبر رابط GitHub أو ملف مضغوط يحتوي على ملف README يشرح كيفية التشغيل.
MD,
                                ],
                            ],
                        ],
                    ],
                ],
            ],

            // 2. Laravel & Backend
            [
                'title' => 'احترف إطار العمل Laravel وبناء واجهات RESTful APIs عالية الأداء',
                'slug' => 'mastering-laravel-restful-apis-performance',
                'category_slug' => 'databases-backend',
                'instructor_email' => 'sarah.mansour@education.test',
                'subtitle' => 'دليلك المتكامل لإتقان Laravel 11، هندسة البيانات بـ Eloquent، المعالجة غير المتزامنة بـ Queues، وتأمين الخدمات.',
                'description' => <<<'MD'
يُعد إطار عمل Laravel الخيار الأول لبناء تطبيقات الويب الحديثة والمعقدة في كبرى الشركات.

ستتعلم في هذه الدورة كيفية استغلال إمكانيات Laravel المتقدمة لبناء أنظمة سريعة، منظمة ومبنية وفق معايير Clean Architecture، بدءاً من العلاقات وقواعد البيانات وحتى التحسين وتخزين الكاش في Redis.
MD,
                'level' => 'advanced',
                'price_cents' => 7999,
                'discount_price_cents' => 5499,
                'is_featured' => true,
                'requirements' => [
                    'معرفة بأساسيات لغة PHP والبرمجة كائنية التوجه (OOP)',
                    'فهم أساسي لقواعد بيانات SQL وتصميم الجداول',
                ],
                'outcomes' => [
                    'تصميم وهيكلة واجهات API احترافية تدعم المعايير العالمية',
                    'إتقان Eloquent ORM وتحسين استعلامات قواعد البيانات ومنع مشاكل N+1',
                    'إدارة المهام الخلفية وخطوط الانتظار Queues والتنبيهات المباشرة',
                    'تطبيق أفضل ممارسات الأمان والتوثيق عبر Sanctum و Passport',
                ],
                'target_audience' => [
                    'مطورو PHP الراغبون في احتراف أحدث إصدارات Laravel',
                    'مهندسو الـ Backend الباحثون عن معايير الأداء والأنظمة القابلة للتوسع',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: معمارية Laravel الحديثة وهندسة الخدمات',
                        'lessons' => [
                            [
                                'title' => 'مقدمة وهيكلة Laravel 11 ومفهوم Service Container',
                                'type' => 'video',
                                'duration_minutes' => 16,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'إتقان العلاقات المتقدمة في Eloquent ORM وتحسين الاستعلامات',
                                'type' => 'article',
                                'duration_minutes' => 20,
                                'is_preview' => false,
                                'content' => <<<'MD'
### تجنب مشكلة N+1 Query Problem في Laravel

تعتبر مشكلة N+1 من أشهر أسباب بطء تطبيقات الويب عند جلب البيانات المرتبطة.

```php
// ❌ استعلام بطيء يسبب N+1:
$courses = Course::all();
foreach ($courses as $course) {
    echo $course->instructor->name;
}

// ✅ الحل الصحيح باستخدام Eager Loading:
$courses = Course::with('instructor')->get();
```
MD,
                            ],
                            [
                                'title' => 'بناء API Resources وتوحيد شكل الاستجابات JSON',
                                'type' => 'video',
                                'duration_minutes' => 19,
                                'is_preview' => false,
                                'content' => null,
                            ],
                        ],
                    ],
                ],
            ],

            // 3. UI/UX Design
            [
                'title' => 'دبلومة تصميم تجربة وواجهة المستخدم الشاملة باستخدام Figma',
                'slug' => 'ui-ux-design-mastery-figma-diploma',
                'category_slug' => 'ui-ux-design',
                'instructor_email' => 'nour.ibrahim@education.test',
                'subtitle' => 'من أبحاث المستخدم ورسم الـ Wireframes إلى تصميم واجهات تفاعلية وأنظمة تصميم احترافية جاهزة للتطوير.',
                'description' => <<<'MD'
تصميم تجربة المستخدم (UI/UX) هو الفارق بين التطبيقات الناجحة والتطبيقات المهجورة.

في هذه الدبلومة الشاملة، ستخوض رحلة عملية متكاملة تبدأ من فهم المشاكل الحقيقية وسلوك المستخدمين، مروراً بهيكلة المعلومات ورسم النماذج الأولية، وانتهاءً بتصميم واجهات فائقة الجاذبية باستخدام أقوى ميزات Figma مثل Auto Layout و Components و Variables.
MD,
                'level' => 'beginner',
                'price_cents' => 5999,
                'discount_price_cents' => 3999,
                'is_featured' => true,
                'requirements' => [
                    'لا يشترط وجود أي خبرة سابقة في التصميم أو الرسم',
                    'حساب مجاني على موقع Figma وجهاز حاسوب',
                ],
                'outcomes' => [
                    'إجراء أبحاث المستخدم وبناء شخصيات الاستخدام (User Personas)',
                    'رسم Wireframes دقيقة وهندسة تجربة استخدام سلسة',
                    'إتقان أدوات Figma المتقدمة (Auto Layout, Design Tokens, Components)',
                    'بناء Portfolio شخصي يحتوي على 3 مشاريع واقعية مدروسة',
                ],
                'target_audience' => [
                    'المبتدئون الراغبون في دخول مجال تصميم المنتجات الرقمية UI/UX',
                    'المبرمجون الراغبون في تحسين مهاراتهم في التصميم الجمالي والوظيفي',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: مبادئ تجربة المستخدم (UX Principles) وسلوك المستفيد',
                        'lessons' => [
                            [
                                'title' => 'ما هو الفرق بين UI و UX وكيف يفكر مصمم المنتجات؟',
                                'type' => 'video',
                                'duration_minutes' => 15,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'قوانين تجربة المستخدم العالمية (Laws of UX) وتطبيقاتها العملية',
                                'type' => 'article',
                                'duration_minutes' => 14,
                                'is_preview' => false,
                                'content' => <<<'MD'
### أهم قوانين تجربة المستخدم التي يجب تطبيقها:

1. **قانون جاكوب (Jakob's Law):**
يفضل المستخدمون أن تعمل واجهتك بالطريقة ذاتها التي تعمل بها المواقع والتطبيقات التي اعتادوا عليها، فلا تعقد التجارب المألوفة دون ضرورة.

2. **قانون فيتس (Fitts's Law):**
كلما كان زر الإجراء الأساسي (CTA) أقرب وأكبر وأوضح للنقر، قل الوقت والجهد المطلوب من المستخدم للوصول إليه.

3. **قانون هيك (Hick's Law):**
يزداد الوقت اللازم لاتخاذ القرار كلما زاد عدد الخيارات المعروضة؛ لذا بسّط الخيارات وقسم النماذج الطويلة إلى خطوات مرحلية.
MD,
                            ],
                            [
                                'title' => 'أدوات Figma الأساسية: Frames و Shapes و Constraints',
                                'type' => 'video',
                                'duration_minutes' => 25,
                                'is_preview' => false,
                                'content' => null,
                            ],
                        ],
                    ],
                ],
            ],

            // 4. AI & Machine Learning
            [
                'title' => 'الذكاء الاصطناعي وتطبيقات تعلم الآلة باستخدام Python',
                'slug' => 'artificial-intelligence-machine-learning-python',
                'category_slug' => 'machine-learning-ai',
                'instructor_email' => 'ahmed.elshinawy@education.test',
                'subtitle' => 'انطلق في عالم الـ AI: بناء وتدريب وتقييم نماذج تعلم الآلة ومعالجة البيانات الضخمة وبناء تطبيقات عملية.',
                'description' => <<<'MD'
يُشكل الذكاء الاصطناعي الثورة التقنية الأكبر في عصرنا الحالي.

ستتعلم في هذا الكورس كيفية استخدام لغة Python ومكتباتها القياسية (NumPy, Pandas, Scikit-Learn, Matplotlib) لتحليل البيانات، وتدريب نماذج التنبؤ والتصنيف والانحدار، وفهم الرياضيات والخوارزميات الكامنة وراء الذكاء الاصطناعي بأسلوب عملي مبسط.
MD,
                'level' => 'intermediate',
                'price_cents' => 8999,
                'discount_price_cents' => 5999,
                'is_featured' => true,
                'requirements' => [
                    'معرفة بأساسيات لغة Python والمتغيرات والدوال',
                    'مفاهيم رياضية وإحصائية أساسية (المتوسط، الجبر الخطي البسيط)',
                ],
                'outcomes' => [
                    'تنظيف واستكشاف وهندسة البيانات الإحصائية المعقدة',
                    'بناء نماذج التعلم الخاضع للإشراف وغير الخاضع للإشراف (Supervised & Unsupervised)',
                    'تقييم النماذج بدقة وتجنب ظاهرة الـ Overfitting',
                    'نشر نماذج الذكاء الاصطناعي كواجهات API برمجية للاستخدام المباشر',
                ],
                'target_audience' => [
                    'مطورو البرمجيات الراغبون في التخصص في الذكاء الاصطناعي وعلم البيانات',
                    'محللو البيانات والمهندسون المهتمون بنمذجة التنبؤات المستقبلية',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: معالجة البيانات واستكشافها باستخدام Pandas و NumPy',
                        'lessons' => [
                            [
                                'title' => 'البيئة التحليلية عبر Jupyter Notebooks وأساسيات المصفوفات في NumPy',
                                'type' => 'video',
                                'duration_minutes' => 20,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'معالجة وتنظيف الجداول الإحصائية المفقودة باستخدام مكتبة Pandas',
                                'type' => 'article',
                                'duration_minutes' => 16,
                                'is_preview' => false,
                                'content' => <<<'MD'
### خطوات معالجة البيانات قبل تدريب النماذج:

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# قراءة البيانات ومعالجة القيم المفقودة
df = pd.read_csv('dataset.csv')
df.fillna(df.median(), inplace=True)

# تقسيم البيانات إلى تدريب واختبار
X = df.drop('target', axis=1)
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```
MD,
                            ],
                        ],
                    ],
                ],
            ],

            // 5. Cyber Security
            [
                'title' => 'أساسيات الأمن السيبراني واختبار الاختراق الأخلاقي (Ethical Hacking)',
                'slug' => 'ethical-hacking-cybersecurity-fundamentals',
                'category_slug' => 'ethical-hacking',
                'instructor_email' => 'tarek.elawady@education.test',
                'subtitle' => 'تعلم منهجية التفكير الأمني، فحص الثغرات، اختبار اختراق الشبكات وتطبيقات الويب، وحماية البنى الرقمية.',
                'description' => <<<'MD'
مع تزايد الهجمات الإلكترونية، أصبح تأمين التطبيقات والشبكات ضرورة قصوى لجميع المؤسسات.

يقودك هذا الكورس العملي عبر بيئات اختبار اختراق حقيقية ومصرح بها (Virtual Labs) لتتعلم كيف يكتشف المهاجمون الثغرات وكيف يقوم مهندسو الأمن السيبراني بسدها وحماية البيانات الحساسة.
MD,
                'level' => 'beginner',
                'price_cents' => 7499,
                'discount_price_cents' => 4999,
                'is_featured' => true,
                'requirements' => [
                    'فهم أساسي لمبادئ عمل الشبكات وبروتوكول TCP/IP',
                    'جهاز حاسوب يدعم تشغيل الأنظمة الوهمية (VirtualBox أو VMware)',
                ],
                'outcomes' => [
                    'إتقان استخدام نظام Kali Linux وأدوات الفحص الأمني مثل Nmap و Wireshark',
                    'فحص وتحديد ثغرات تطبيقات الويب الشائعة وفق تصنيف OWASP Top 10',
                    'كتابة تقارير أمنية احترافية واقتراح حلول تصحيحية للمطورين',
                    'تأمين الأنظمة وتطبيق إجراءات الدفاع بالعمق (Defense-in-Depth)',
                ],
                'target_audience' => [
                    'المبتدئون الراغبون في بدء مسار مهني في الأمن السيبراني',
                    'مديرو النظم ومطورو الويب المهتمون بتأمين منتجاتهم وحمايتها',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: أساسيات الشبكات والبيئة المعملية لاختبار الاختراق',
                        'lessons' => [
                            [
                                'title' => 'تثبيت بيئة Kali Linux وبناء المعمل الأمني الآمن',
                                'type' => 'video',
                                'duration_minutes' => 18,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'فحص المنافذ والخدمات النشطة باستخدام Nmap باحترافية',
                                'type' => 'article',
                                'duration_minutes' => 15,
                                'is_preview' => false,
                                'content' => <<<'MD'
### أوامر فحص المنافذ الأساسية في أداة Nmap:

```bash
# فحص سريع للمنافذ الأكثر شيوعاً واكتشاف إصدارات الخدمات
nmap -sV -sC -T4 target_ip

# فحص شامل لجميع المنافذ الـ 65535 مع التخفي الخفيف
nmap -p- -sS -O target_ip
```

تذكر دائماً أن استخدام هذه الأدوات يجب أن يتم حصراً داخل المعامل الافتراضية أو بموجب إذن خطي مسبق.
MD,
                            ],
                        ],
                    ],
                ],
            ],

            // 6. Cloud & DevOps
            [
                'title' => 'احتراف Docker و Kubernetes وهندسة خطوط النشر الآلي CI/CD',
                'slug' => 'docker-kubernetes-devops-pipeline-mastery',
                'category_slug' => 'docker-kubernetes',
                'instructor_email' => 'karim.abdelaziz@education.test',
                'subtitle' => 'احترف تقنيات الحاويات وإدارتها على نطاق واسع وأتمتة اختبار ونشر البرمجيات على الخوادم السحابية.',
                'description' => <<<'MD'
تعتمد الشركات الرائدة عالمياً على تقنيات DevOps لتسريع إطلاق المنتجات وضمان استقرار الخوادم تحت الضغط العالي.

في هذه الدورة المتقدمة، ستتعلم كيفية تحويل التطبيقات إلى حاويات خفيفة باستخدام Docker، وتوزيعها وإدارتها تلقائياً عبر Kubernetes، وبناء خطوط تكامل ونشر مستمر (CI/CD) بالكامل باستخدام GitHub Actions.
MD,
                'level' => 'advanced',
                'price_cents' => 8499,
                'discount_price_cents' => 5999,
                'is_featured' => true,
                'requirements' => [
                    'معرفة بأساسيات أوامر Linux والتعامل مع الطرفية (Terminal)',
                    'خبرة في بناء تطبيق ويب بأي لغة برمجية (Node.js, PHP, Python)',
                ],
                'outcomes' => [
                    'بناء ملفات Dockerfile وصور حاويات محسنة وصغيرة الحجم',
                    'إدارة مصفوفات الخدمات باستخدام Docker Compose',
                    'نشر التطبيقات وإدارتها عبر مصفوفات Kubernetes (Pods, Deployments, Services)',
                    'أتمتة الفحص والاختبار والنشر إلى السحابة عبر GitHub Actions CI/CD',
                ],
                'target_audience' => [
                    'مهندسو البرمجيات الراغبون في التخصص كمهندسي DevOps و Cloud',
                    'مديرو النظم الراغبون في الانتقال إلى إدارة الأنظمة عبر الحاويات',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: أسس الحاويات وبناء صور Docker عالية الكفاءة',
                        'lessons' => [
                            [
                                'title' => 'ما هي الحاويات وما الفرق بينها وبين الأجهزة الافتراضية (VMs)؟',
                                'type' => 'video',
                                'duration_minutes' => 14,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'كتابة Dockerfile احترافي يدعم Multi-stage Builds لتقليل الحجم',
                                'type' => 'article',
                                'duration_minutes' => 16,
                                'is_preview' => false,
                                'content' => <<<'MD'
### تقنية Multi-Stage Build لتقليل حجم صور الحاويات

```dockerfile
# المرحلة الأولى: البناء والتجميع
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# المرحلة الثانية: التشغيل النهائي بصورة خفيفة
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
MD,
                            ],
                        ],
                    ],
                ],
            ],

            // 7. Digital Marketing
            [
                'title' => 'دليل التسويق الرقمي المتكامل وتحسين محركات البحث SEO',
                'slug' => 'comprehensive-digital-marketing-seo-strategy',
                'category_slug' => 'search-engine-optimization',
                'instructor_email' => 'yasmine.farouk@education.test',
                'subtitle' => 'استراتيجيات تصدر نتائج البحث، إدارة ميزانيات الإعلانات، وبناء حملات تسويقية تحقق أعلى عوائد استثمارية.',
                'description' => <<<'MD'
التسويق الرقمي ليس مجرد نشر منشورات عشوائية، بل هو علم واستراتيجية دقيقة تعتمد على فهم الجمهور المستهدف وتحليل البيانات.

تغطي هذه الدورة العملية كل ما تحتاجه لتصبح مسوقاً رقمياً محترفاً، من تحسين محركات البحث (On-Page & Off-Page SEO) وإعلانات Google وتتبع التحويلات عبر Google Analytics 4، إلى بناء مسارات تحويل عملاء متكاملة.
MD,
                'level' => 'beginner',
                'price_cents' => 4999,
                'discount_price_cents' => 3499,
                'is_featured' => false,
                'requirements' => [
                    'معرفة باستخدام الإنترنت وبرامج التصفح الحديثة',
                    'رغبة في تنمية المبيعات والمشاريع عبر القنوات الرقمية',
                ],
                'outcomes' => [
                    'إجراء بحث دقيق عن الكلمات المفتاحية وتحليل المنافسين',
                    'تهيئة المواقع والمتاجر لتصدر نتائج بحث Google العضوية',
                    'إطلاق وإدارة حملات Google Ads الإعلانية بأعلى كفاءة',
                    'قراءة وتفسير لوحات تحليلات GA4 وحساب العائد على الاستثمار (ROI)',
                ],
                'target_audience' => [
                    'أصحاب المتاجر الإلكترونية والشركات الساعون لزيادة مبيعاتهم',
                    'المتخصصون وصناع المحتوى الراغبون في العمل كمسوقين رقميين',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: استراتيجية تحسين محركات البحث (SEO Foundations)',
                        'lessons' => [
                            [
                                'title' => 'كيف تعمل خوارزميات محركات البحث وعوامل الترتيب الأساسية',
                                'type' => 'video',
                                'duration_minutes' => 16,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'دليل عملي: كتابة محتوى متوافق مع معايير SEO وتنسيق العناوين والروابط',
                                'type' => 'article',
                                'duration_minutes' => 12,
                                'is_preview' => false,
                                'content' => <<<'MD'
### عناصر الـ On-Page SEO الأساسية:

1. **عنوان الصفحة (Title Tag):** يجب أن يحتوي على الكلمة المفتاحية الرئيسية في البداية ولا يتجاوز 60 حرفاً.
2. **الوصف التعريفي (Meta Description):** كتابة نص جذاب يحفز على النقر بنسبة CTR عالية بطول بين 120 إلى 155 حرفاً.
3. **بنية العناوين (H1, H2, H3):** تخصيص H1 واحد فقط لكل صفحة واستخدام العناوين الفرعية لتسهيل القراءة للأشخاص ومحركات البحث.
4. **الربط الداخلي (Internal Links):** ربط المقالات والصفحات ذات الصلة لتوزيع قوة الأرشفة (Link Equity).
MD,
                            ],
                        ],
                    ],
                ],
            ],

            // 8. Entrepreneurship & Startups
            [
                'title' => 'بناء وإطلاق الشركات الناشئة من الفكرة إلى أول جولة استثمارية',
                'slug' => 'startup-launch-from-idea-to-investment',
                'category_slug' => 'startup-launching',
                'instructor_email' => 'omar.khaled@education.test',
                'subtitle' => 'دليلك الريادي للتحقق من الأفكار، بناء نموذج العمل التجاري، تصميم المنتج الأولي MVP، والتفاوض مع المستثمرين.',
                'description' => <<<'MD'
تحويل فكرة مبتكرة إلى شركة ناشئة ناجحة وقابلة للتوسع يتطلب منهجية واضحة لتفادي الأخطاء القاتلة.

يقدم لك هذا البرنامج دليلاً خطوة بخطوة يبدأ من دراسة الجدوى ومقابلة العملاء المحتملين، وتطبيق منهجية Lean Startup لبناء الـ MVP بأقل تكلفة، ثم تقييم الشركة وتجهيز عرض الاستثمار (Pitch Deck) لعرضه على الصناديق الاستثمارية.
MD,
                'level' => 'beginner',
                'price_cents' => 5499,
                'discount_price_cents' => 3999,
                'is_featured' => false,
                'requirements' => [
                    'فكرة مشروع أو رغبة جادة في دخول عالم ريادة الأعمال',
                    'الاستعداد لتطبيق المهام والتفاعل مع العملاء الفعليين في السوق',
                ],
                'outcomes' => [
                    'التحقق من الفكرة وملاءمتها لاحتياج السوق (Problem-Solution Fit)',
                    'بناء وتعبئة نموذج العمل التجاري (Business Model Canvas)',
                    'تخطيط وإطلاق المنتج الأولي بأقل جهد وتكلفة (MVP)',
                    'إعداد العرض الاستثماري وحساب المؤشرات المالية والتقييم',
                ],
                'target_audience' => [
                    'رواد الأعمال وأصحاب الأفكار المبتكرة',
                    'المؤسسون الأوائل للشركات التقنية والناشئة',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: تقييم الفكرة والتحقق من احتياج السوق',
                        'lessons' => [
                            [
                                'title' => 'كيف تفرز الأفكار الواعدة وتتأكد من وجود مشكلة تستحق الحل؟',
                                'type' => 'video',
                                'duration_minutes' => 17,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'نموذج العمل التجاري (Business Model Canvas) خطوة بخطوة',
                                'type' => 'article',
                                'duration_minutes' => 15,
                                'is_preview' => false,
                                'content' => <<<'MD'
### الأركان التسعة لنموذج العمل التجاري:

1. **شريحة العملاء (Customer Segments):** من هم العملاء الأكثر حاجة لحلك؟
2. **القيمة المقترحة (Value Propositions):** ما الفائدة والقيمة الفريدة التي تقدمها لهم؟
3. **القنوات (Channels):** كيف ستصل إلى عملائك وتسوق لمنتجك؟
4. **العلاقة مع العملاء (Customer Relationships):** كيف تكسب العملاء وتحافظ عليهم؟
5. **مصادر الإيرادات (Revenue Streams):** كيف ستجني الأموال؟
6. **الموارد والأنشطة والشركاء الرئيسيون** وهيكل التكاليف التقديري.
MD,
                            ],
                        ],
                    ],
                ],
            ],

            // 9. Business & Project Management
            [
                'title' => 'إدارة المشاريع الاحترافية وتطبيق منهجيات Agile و Scrum',
                'slug' => 'project-management-agile-scrum-mastery',
                'category_slug' => 'agile-project-management',
                'instructor_email' => 'hossam.abdullah@education.test',
                'subtitle' => 'اكتسب مهارات قيادة وتنسيق المشاريع، إدارة الأولويات، وتطبيق أطر العمل المرنة لتحقيق أعلى إنتاجية.',
                'description' => <<<'MD'
في بيئة العمل المتسارعة اليوم، أصبحت مهارات إدارة المشاريع والعمل المرن من أكثر المهارات طلباً لدى الشركات العالمية.

تمنحك هذه الدورة إتقاناً عملياً لكيفية إدارة دورة حياة المشروع من البداية وحتى التسليم، وتطبيق اجتماعات Scrum وأدوات التتبع مثل Jira، وإدارة المخاطر وتوقعات أصحاب المصلحة.
MD,
                'level' => 'beginner',
                'price_cents' => 4499,
                'discount_price_cents' => 2999,
                'is_featured' => false,
                'requirements' => [
                    'لا توجد متطلبات مسبقة معقدة',
                    'الرغبة في تطوير مهارات التخطيط والقيادة والتنظيم',
                ],
                'outcomes' => [
                    'تطبيق مبادئ وممارسات إطار العمل Scrum و Kanban بكفاءة',
                    'إدارة وتخطيط السبرنتات (Sprint Planning & Retrospectives)',
                    'استخدام أدوات إدارة المهام وتتبع الإنتاجية الحديثة',
                    'التعامل مع مخاطر المشاريع وتنسيق العمل مع الفرق متعددة التخصصات',
                ],
                'target_audience' => [
                    'مديرو المشاريع الجدد وقادة الفرق التقنية والإدارية',
                    'أعضاء الفرق الراغبون في فهم وتطبيق منهجيات العمل الرشيقة',
                ],
                'sections' => [
                    [
                        'title' => 'الوحدة الأولى: أسس ومبادئ الإدارة الرشيقة للمشاريع (Agile Foundations)',
                        'lessons' => [
                            [
                                'title' => 'مقارنة بين المنهجية التقليدية (Waterfall) والمنهجية المرنة (Agile)',
                                'type' => 'video',
                                'duration_minutes' => 15,
                                'is_preview' => true,
                                'content' => null,
                            ],
                            [
                                'title' => 'أدوار فريق الـ Scrum: مالك المنتج والـ Scrum Master وفريق التطوير',
                                'type' => 'article',
                                'duration_minutes' => 13,
                                'is_preview' => false,
                                'content' => <<<'MD'
### الأدوار الرئيسية في إطار Scrum:

- **مالك المنتج (Product Owner):** المسؤول عن تحديد رؤية المنتج وإدارة أولويات الـ Product Backlog والتواصل مع أصحاب المصلحة.
- **مدرب السكرام (Scrum Master):** الميسر الذي يساعد الفريق على تطبيق المبادئ وإزالة العقبات التي تعيق الإنتاجية.
- **فريق التطوير (Developers):** المتخصصون الذين يقومون بتحويل عناصر الـ Backlog إلى إضافات جاهزة وذات قيمة عملية في نهاية كل سبرنت.
MD,
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
