<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Enums\UserStatus;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class UserSeeder extends Seeder
{
    private const INSTRUCTORS = [
        [
            'name' => 'م. سارة منصور',
            'email' => 'sarah.mansour@education.test',
            'headline' => 'مهندسة برمجيات أولى ومدربة تطوير واجهات',
            'bio' => 'أكثر من 10 سنوات من الخبرة في بناء تطبيقات الويب الضخمة باستخدام React و Next.js و TypeScript وتدريب آلاف المطورين.',
        ],
        [
            'name' => 'د. أحمد الشناوي',
            'email' => 'ahmed.elshinawy@education.test',
            'headline' => 'استشاري وخبير في الذكاء الاصطناعي وعلم البيانات',
            'bio' => 'باحث ومستشار معتمد في تعلم الآلة والشبكات العصبية، ساهم في تطوير خوارزميات تحليلية لعدة شركات كبرى.',
        ],
        [
            'name' => 'م. طارق العوضي',
            'email' => 'tarek.elawady@education.test',
            'headline' => 'خبير أمن سيبراني واختبار اختراق معتمد (OSCP, CEH)',
            'bio' => 'متخصص في تقييم الثغرات وحماية البنية التحتية والأنظمة الحساسة، وقام بتدريب فرق أمنية متخصصة.',
        ],
        [
            'name' => 'أ. نور الهدى إبراهيم',
            'email' => 'nour.ibrahim@education.test',
            'headline' => 'رئيسة قسم تصميم تجربة المستخدم وأنظمة التصميم',
            'bio' => 'قادت تصميم تجارب رقمية لأكثر من 50 منتجاً وتطبيقاً ناجحاً مع التركيز على أبحاث المستخدم وبناء Design Systems.',
        ],
        [
            'name' => 'م. كريم عبد العزيز',
            'email' => 'karim.abdelaziz@education.test',
            'headline' => 'مهندس حلول سحابية وخبير DevOps معتمد (AWS & CKA)',
            'bio' => 'متخصص في بناء وتوسيع الخوادم السحابية وإدارة الحاويات باستخدام Docker و Kubernetes وخطوط CI/CD.',
        ],
        [
            'name' => 'أ. عمر خالد',
            'email' => 'omar.khaled@education.test',
            'headline' => 'مستثمر ومؤسس شركات ناشئة ومرشد ريادة أعمال',
            'bio' => 'أسس 3 شركات ناشئة ناجحة وساعد أكثر من 40 مشروعاً في مراحل الإطلاق وجولات التمويل الاستثماري.',
        ],
        [
            'name' => 'أ. ياسمين فاروق',
            'email' => 'yasmine.farouk@education.test',
            'headline' => 'استشارية تسويق رقمي واستراتيجيات نمو الأعمال',
            'bio' => 'أدارت حملات إعلانية بملايين الدولارات وحققت معدلات نمو استثنائية لشركات التجارة الإلكترونية والتطبيقات.',
        ],
        [
            'name' => 'م. حسام الدين عبد الله',
            'email' => 'hossam.abdullah@education.test',
            'headline' => 'مدير مشاريع تقنية معتمد PMP & Agile Coach',
            'bio' => 'خبير قيادة وتنسيق فرق العمل التقنية وتطبيق أطر Scrum و Kanban بكفاءة عالية في كبرى المشاريع.',
        ],
    ];

    private const STUDENT_NAMES = [
        'محمد علي البكري',
        'فاطمة الزهراء حسن',
        'يوسف إبراهيم الشريف',
        'ريم عبد الرحمن',
        'عبد الله محمود القحطاني',
        'مريم مصطفى خالد',
        'خالد وليد النجار',
        'شهد عادل رضوان',
        'عمر فاروق السيد',
        'هند سالم العتيبي',
        'أحمد فؤاد الشامي',
        'سارة عماد الدين',
        'حمزة سامي الدوسري',
        'نادية كمال الجابري',
        'بلال تيسير عبد الله',
    ];

    public function run(): void
    {
        // 1. Core Demo Accounts
        $this->createDemoUser('مدير المنصة', 'admin@education.test', UserRole::Admin);
        $this->createDemoUser('سارة منصور', 'instructor@education.test', UserRole::Instructor, [
            'headline' => 'مهندسة برمجيات أولى ومدربة تقنية معتمدة',
            'bio' => 'أكثر من 10 سنوات في تدريب وتطوير الكفاءات البرمجية وبناء تطبيقات الويب الحديثة.',
        ]);
        $this->createDemoUser('محمد علي', 'student@education.test', UserRole::Student, [
            'headline' => 'طالب شغوف بتعلم أحدث التقنيات',
        ]);

        // 2. Realistic Instructors
        foreach (self::INSTRUCTORS as $inst) {
            $this->createDemoUser($inst['name'], $inst['email'], UserRole::Instructor, [
                'headline' => $inst['headline'],
                'bio' => $inst['bio'],
            ]);
        }

        // 3. Realistic Students
        foreach (self::STUDENT_NAMES as $idx => $studentName) {
            $this->createDemoUser($studentName, 'student'.($idx + 1).'@education.test', UserRole::Student, [
                'headline' => 'متعلم ومطور برمجيات واعد',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $extra
     */
    private function createDemoUser(string $name, string $email, UserRole $role, array $extra = []): void
    {
        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'role' => $role->value,
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
                ...$extra,
            ],
        );
    }
}
