<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Infrastructure\Persistence\Eloquent\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

final class CategorySeeder extends Seeder
{
    /**
     * Top-level categories with Arabic names and clean slugs.
     *
     * @var array<int, array{name: string, slug: string, icon: string, color: string, children: array<int, array{name: string, slug: string}>}>
     */
    private const CATEGORIES = [
        [
            'name' => 'تطوير البرمجيات والويب',
            'slug' => 'development',
            'icon' => 'code',
            'color' => 'blue',
            'children' => [
                ['name' => 'تطوير الويب المتكامل', 'slug' => 'web-development'],
                ['name' => 'تطبيقات الهواتف الذكية', 'slug' => 'mobile-development'],
                ['name' => 'لغات البرمجة والأنظمة', 'slug' => 'programming-languages'],
                ['name' => 'قواعد البيانات وهندسة الـ Backend', 'slug' => 'databases-backend'],
            ],
        ],
        [
            'name' => 'تصميم وتجربة المستخدم',
            'slug' => 'design',
            'icon' => 'palette',
            'color' => 'purple',
            'children' => [
                ['name' => 'تصميم واجهات وتجربة المستخدم UI/UX', 'slug' => 'ui-ux-design'],
                ['name' => 'أنظمة التصميم الاحترافية Design Systems', 'slug' => 'design-systems'],
                ['name' => 'أبحاث تجربة المستخدم UX Research', 'slug' => 'ux-research'],
            ],
        ],
        [
            'name' => 'الذكاء الاصطناعي وعلم البيانات',
            'slug' => 'data-science',
            'icon' => 'chart-line',
            'color' => 'orange',
            'children' => [
                ['name' => 'تعلم الآلة والذكاء الاصطناعي', 'slug' => 'machine-learning-ai'],
                ['name' => 'تحليل البيانات واستخراج الرؤى', 'slug' => 'data-analysis-bi'],
                ['name' => 'التعلم العميق والشبكات العصبية', 'slug' => 'deep-learning'],
            ],
        ],
        [
            'name' => 'الأمن السيبراني والشبكات',
            'slug' => 'cyber-security',
            'icon' => 'shield-lock',
            'color' => 'cyan',
            'children' => [
                ['name' => 'أساسيات الأمن واختبار الاختراق', 'slug' => 'ethical-hacking'],
                ['name' => 'تأمين الشبكات والأنظمة', 'slug' => 'network-security'],
                ['name' => 'الأمن السيبراني السحابي', 'slug' => 'cloud-security'],
            ],
        ],
        [
            'name' => 'الحوسبة السحابية و DevOps',
            'slug' => 'cloud-computing',
            'icon' => 'server',
            'color' => 'cyan',
            'children' => [
                ['name' => 'الحوسبة السحابية و AWS', 'slug' => 'aws-cloud'],
                ['name' => 'أدوات الحاويات Docker & Kubernetes', 'slug' => 'docker-kubernetes'],
                ['name' => 'أتمتة النشر وبناء خطوط CI/CD', 'slug' => 'devops-ci-cd'],
            ],
        ],
        [
            'name' => 'إدارة الأعمال والقيادة',
            'slug' => 'business',
            'icon' => 'briefcase',
            'color' => 'green',
            'children' => [
                ['name' => 'إدارة المشاريع الاحترافية Agile', 'slug' => 'agile-project-management'],
                ['name' => 'التخطيط الاستراتيجي والقيادة', 'slug' => 'strategic-leadership'],
                ['name' => 'الإدارة المالية واستراتيجية الأعمال', 'slug' => 'financial-management'],
            ],
        ],
        [
            'name' => 'التسويق الرقمي ونمو المبيعات',
            'slug' => 'digital-marketing',
            'icon' => 'speakerphone',
            'color' => 'red',
            'children' => [
                ['name' => 'تحسين محركات البحث SEO', 'slug' => 'search-engine-optimization'],
                ['name' => 'إعلانات وسائل التواصل و Google Ads', 'slug' => 'social-google-ads'],
                ['name' => 'صناعة المحتوى واستراتيجيات النمو', 'slug' => 'content-growth-marketing'],
            ],
        ],
        [
            'name' => 'ريادة الأعمال والشركات الناشئة',
            'slug' => 'entrepreneurship',
            'icon' => 'rocket',
            'color' => 'amber',
            'children' => [
                ['name' => 'بناء وإطلاق الشركات الناشئة', 'slug' => 'startup-launching'],
                ['name' => 'تصميم نموذج العمل وملاءمة السوق', 'slug' => 'business-model-market-fit'],
                ['name' => 'جولات الاستثمار وتوسيع الأعمال', 'slug' => 'venture-capital-scaling'],
            ],
        ],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $position => $definition) {
            $parent = Category::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'name' => $definition['name'],
                    'icon' => $definition['icon'],
                    'color' => $definition['color'],
                    'position' => $position + 1,
                    'is_active' => true,
                ],
            );

            foreach ($definition['children'] as $childPosition => $child) {
                Category::query()->updateOrCreate(
                    ['slug' => $child['slug']],
                    [
                        'parent_id' => $parent->id,
                        'name' => $child['name'],
                        'icon' => $definition['icon'],
                        'color' => $definition['color'],
                        'position' => $childPosition + 1,
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
