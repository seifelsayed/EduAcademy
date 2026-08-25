import type { Course, CourseDetail, Section, Lesson } from '@/core/domain/schemas/catalog'
import type { RatingBreakdown } from '@/core/domain/schemas/engagement'
import type { CoursePlayer } from '@/core/domain/schemas/learning'
import type { AppLanguage } from '@/shared/lib/i18n/types'
import { useLanguage } from '@/stores/uiStore'

export interface LocalizedString {
  ar: string
  en: string
}

export interface LocalizedCourseEntry {
  title: LocalizedString
  subtitle: LocalizedString
  description: LocalizedString
  category: LocalizedString
  instructor: {
    name: LocalizedString
    headline?: LocalizedString
    bio?: LocalizedString
  }
  level: LocalizedString
  outcomes: { ar: string[]; en: string[] }
  requirements: { ar: string[]; en: string[] }
  sections?: Array<{
    title: LocalizedString
    lessons: Array<{
      title: LocalizedString
      content?: LocalizedString
    }>
  }>
}

export const CATEGORY_TRANSLATIONS: Record<string, LocalizedString> = {
  // Top-Level Specialization Tracks
  'development': { ar: 'تطوير البرمجيات والويب', en: 'Software & Web Development' },
  'design': { ar: 'تصميم وتجربة المستخدم', en: 'UI/UX Design & Product Experience' },
  'data-science': { ar: 'الذكاء الاصطناعي وعلم البيانات', en: 'AI & Data Science' },
  'cyber-security': { ar: 'الأمن السيبراني والشبكات', en: 'Cybersecurity & Networks' },
  'cloud-computing': { ar: 'الحوسبة السحابية و DevOps', en: 'Cloud Computing & DevOps' },
  'cloud-devops': { ar: 'الحوسبة السحابية وهندسة DevOps', en: 'Cloud Computing & DevOps' },
  'business': { ar: 'إدارة الأعمال والقيادة', en: 'Business & Leadership' },
  'digital-marketing': { ar: 'التسويق الرقمي ونمو المبيعات', en: 'Digital Marketing & Growth' },
  'entrepreneurship': { ar: 'ريادة الأعمال والشركات الناشئة', en: 'Entrepreneurship & Startups' },
  'business-entrepreneurship': { ar: 'ريادة الأعمال وإدارة المشاريع', en: 'Business & Entrepreneurship' },

  // Sub-Categories / Specialized Modules
  'web-development': { ar: 'تطوير الويب المتكامل', en: 'Full-Stack Web Development' },
  'mobile-development': { ar: 'تطبيقات الهواتف الذكية', en: 'Mobile App Development' },
  'programming-languages': { ar: 'لغات البرمجة والأنظمة', en: 'Programming Languages & Systems' },
  'databases-backend': { ar: 'قواعد البيانات وهندسة الـ Backend', en: 'Databases & Backend Engineering' },
  'ui-ux-design': { ar: 'تصميم واجهات وتجربة المستخدم UI/UX', en: 'UI/UX Design' },
  'design-systems': { ar: 'أنظمة التصميم الاحترافية Design Systems', en: 'Design Systems' },
  'ux-research': { ar: 'أبحاث تجربة المستخدم UX Research', en: 'UX Research' },
  'machine-learning-ai': { ar: 'تعلم الآلة والذكاء الاصطناعي', en: 'Machine Learning & AI' },
  'data-analysis-bi': { ar: 'تحليل البيانات واستخراج الرؤى', en: 'Data Analytics & Business Intelligence' },
  'deep-learning': { ar: 'التعلم العميق والشبكات العصبية', en: 'Deep Learning & Neural Networks' },
  'ethical-hacking': { ar: 'أساسيات الأمن واختبار الاختراق', en: 'Ethical Hacking & Pen Testing' },
  'network-security': { ar: 'تأمين الشبكات والأنظمة', en: 'Network & System Security' },
  'cloud-security': { ar: 'الأمن السيبراني السحابي', en: 'Cloud Security' },
  'aws-cloud': { ar: 'الحوسبة السحابية و AWS', en: 'AWS Cloud Infrastructure' },
  'docker-kubernetes': { ar: 'أدوات الحاويات Docker & Kubernetes', en: 'Docker & Kubernetes Containers' },
  'devops-ci-cd': { ar: 'أتمتة النشر وبناء خطوط CI/CD', en: 'CI/CD Automation & Pipelines' },
  'agile-project-management': { ar: 'إدارة المشاريع الاحترافية Agile', en: 'Agile & Scrum Project Management' },
  'strategic-leadership': { ar: 'التخطيط الاستراتيجي والقيادة', en: 'Strategic Planning & Leadership' },
  'financial-management': { ar: 'الإدارة المالية واستراتيجية الأعمال', en: 'Financial Management' },
  'search-engine-optimization': { ar: 'تحسين محركات البحث SEO', en: 'Search Engine Optimization (SEO)' },
  'social-google-ads': { ar: 'إعلانات وسائل التواصل و Google Ads', en: 'Social Media & Google Ads' },
  'content-growth-marketing': { ar: 'صناعة المحتوى واستراتيجيات النمو', en: 'Content & Growth Marketing' },
  'startup-launching': { ar: 'بناء وإطلاق الشركات الناشئة', en: 'Startup Launch & Scale' },
  'business-model-market-fit': { ar: 'تصميم نموذج العمل وملاءمة السوق', en: 'Business Model & Market Fit' },
  'venture-capital-scaling': { ar: 'جولات الاستثمار وتوسيع الأعمال', en: 'Venture Capital & Growth' },
}

export function getLocalizedCategoryName(
  category: { name: string; slug?: string | null } | null | undefined,
  lang: AppLanguage,
): string {
  if (!category) return ''

  if (category.slug && category.slug in CATEGORY_TRANSLATIONS) {
    const entry = CATEGORY_TRANSLATIONS[category.slug]
    if (entry) return entry[lang]
  }

  for (const item of Object.values(CATEGORY_TRANSLATIONS)) {
    if (item.ar.trim() === category.name.trim() || item.en.trim() === category.name.trim()) {
      return item[lang]
    }
  }

  // Robust fuzzy matching for common category keywords
  const raw = category.name.toLowerCase()
  if (raw.includes('برمج') || raw.includes('تطوير') || raw.includes('software') || raw.includes('develop')) {
    return lang === 'ar' ? 'تطوير البرمجيات والويب' : 'Software & Web Development'
  }
  if (raw.includes('تصميم') || raw.includes('واجهات') || raw.includes('design') || raw.includes('ui')) {
    return lang === 'ar' ? 'تصميم وتجربة المستخدم' : 'UI/UX Design & Product Experience'
  }
  if (raw.includes('ذكاء') || raw.includes('بيانات') || raw.includes('data') || raw.includes('ai')) {
    return lang === 'ar' ? 'الذكاء الاصطناعي وعلم البيانات' : 'AI & Data Science'
  }
  if (raw.includes('أمن') || raw.includes('cyber') || raw.includes('security')) {
    return lang === 'ar' ? 'الأمن السيبراني والشبكات' : 'Cybersecurity & Networks'
  }
  if (raw.includes('سحاب') || raw.includes('cloud') || raw.includes('devops')) {
    return lang === 'ar' ? 'الحوسبة السحابية و DevOps' : 'Cloud Computing & DevOps'
  }
  if (raw.includes('أعمال') || raw.includes('إدارة') || raw.includes('business') || raw.includes('leadership')) {
    return lang === 'ar' ? 'إدارة الأعمال والقيادة' : 'Business & Leadership'
  }
  if (raw.includes('تسويق') || raw.includes('market') || raw.includes('seo') || raw.includes('ads')) {
    return lang === 'ar' ? 'التسويق الرقمي ونمو المبيعات' : 'Digital Marketing & Growth'
  }
  if (raw.includes('ريادة') || raw.includes('ناشئة') || raw.includes('startup') || raw.includes('entrepreneur')) {
    return lang === 'ar' ? 'ريادة الأعمال والشركات الناشئة' : 'Entrepreneurship & Startups'
  }

  return category.name
}

export const LOCALIZED_CATALOG: Record<string, LocalizedCourseEntry> = {
  // 1. Fullstack Web React + Node.js
  'fullstack-web-development-react-nodejs': {
    title: {
      ar: 'تطوير تطبيقات الويب المتكاملة باستخدام React و Node.js',
      en: 'Full-Stack Web Development with React and Node.js',
    },
    subtitle: {
      ar: 'احترف بناء تطبيقات الويب الحديثة من الصفر وحتى نشر تطبيق إنتاجي متكامل مع قاعدة بيانات وواجهة برمجة API.',
      en: 'Master building modern full-stack web applications from scratch to production deployment with APIs and databases.',
    },
    description: {
      ar: `تعلّم كيفية بناء تطبيقات ويب عصرية وشاملة (Full-Stack) تجمع بين قوة وسرعة مكتبة React.js في بناء واجهات المستخدم التفاعلية، وكفاءة وقابلية توسع بيئة Node.js و Express في الخوادم وقواعد البيانات.

### ماذا ستتعلم في هذا المسار؟
- فهم عميق لمعمارية تطبيقات الويب الحديثة والتواصل بين العميل والخادم.
- إتقان React Hooks و Custom Hooks وإدارة الحالة المتقدمة.
- بناء خوادم RESTful APIs آمنة باستخدام Node.js و Express مع التوثيق عبر JWT.
- التعامل مع قواعد بيانات MongoDB و PostgreSQL ونمذجة البيانات بكفاءة.
- التعامل مع المدفوعات ورفع الملفات وتأمين التطبيق ضد الثغرات الشائعة.
- تجهيز التطبيق للإنتاج ونشره على منصات سحابية مثل Vercel و Render.`,
      en: `Learn how to build modern, production-grade full-stack web applications combining the reactive power of React.js with the scalability of Node.js and Express.

### What you will learn in this course:
- Deep understanding of modern web architectures and client-server communication.
- Mastering React Hooks, Custom Hooks, and state management techniques.
- Building secure RESTful APIs with Node.js, Express, and JWT authentication.
- Working with MongoDB and PostgreSQL databases and designing efficient data schemas.
- Handling secure payments, file uploads, and web security best practices.
- Preparing production bundles and deploying to cloud platforms like Vercel and Render.`,
    },
    category: {
      ar: 'تطوير الويب المتكامل',
      en: 'Web Development',
    },
    instructor: {
      name: {
        ar: 'م. سارة منصور',
        en: 'Eng. Sarah Mansour',
      },
      headline: {
        ar: 'مهندسة برمجيات أولى ومدربة تطوير واجهات',
        en: 'Senior Full-Stack Engineer & Frontend Instructor',
      },
      bio: {
        ar: 'خبرة تزيد عن 8 سنوات في بناء وتطوير الأنظمة السحابية والواجهات التفاعلية المعقدة.',
        en: '8+ years of experience engineering high-performance cloud web architectures and reactive interfaces.',
      },
    },
    level: {
      ar: 'متوسط',
      en: 'Intermediate',
    },
    outcomes: {
      ar: [
        'بناء تطبيقات React تفاعلية سريعة وقابلة للصيانة',
        'إنشاء وتأمين واجهات RESTful APIs متقدمة باستخدام Node.js',
        'ربط وإدارة قواعد البيانات وإجراء عمليات CRUD مع المصادقة',
        'نشر التطبيق الكامل على السحابة وتجهيزه لسوق العمل الفعلي',
      ],
      en: [
        'Build fast, scalable, and maintainable React web applications',
        'Engineer and secure RESTful APIs with Node.js and Express',
        'Connect and manage relational and document databases with authentication',
        'Deploy production applications to the cloud ready for real-world employment',
      ],
    },
    requirements: {
      ar: [
        'معرفة جيدة بلغة JavaScript وأساسيات ES6+',
        'إلمام بأساسيات HTML5 و CSS3',
        'جهاز حاسوب مثبت عليه Node.js ومحرر أكواد مثل VS Code',
      ],
      en: [
        'Good understanding of JavaScript and ES6+ features',
        'Basic familiarity with HTML5 and CSS3',
        'Computer with Node.js and a code editor like VS Code installed',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: أساسيات React ومفاهيم المكونات (Components)',
          en: 'Module 1: React Fundamentals and Component Architecture',
        },
        lessons: [
          {
            title: {
              ar: 'مقدمة إلى React وتهيئة بيئة العمل الحديثة عبر Vite',
              en: 'Introduction to React and Modern Environment Setup via Vite',
            },
          },
          {
            title: {
              ar: 'هيكلية المكونات (Components) والـ JSX وكتابة كود نظيف',
              en: 'Component Architecture, JSX, and Clean Code Principles',
            },
          },
          {
            title: {
              ar: 'دليل شامل: فهم دورة حياة المكونات والتعامل مع الـ Props و State',
              en: 'Comprehensive Guide: Lifecycle, Props, and State Management',
            },
          },
          {
            title: {
              ar: 'اختبار فهم أساسيات React والتعامل مع الأحداث',
              en: 'Knowledge Check: React Core Concepts & Events',
            },
          },
        ],
      },
      {
        title: {
          ar: 'الوحدة الثانية: بناء الخادم وواجهات البرمجة بواسطة Node.js و Express',
          en: 'Module 2: Server Architecture and REST APIs with Node.js & Express',
        },
        lessons: [
          {
            title: {
              ar: 'إنشاء خادم Express وهيكلة المجلدات بنظام MVC',
              en: 'Setting up an Express Server with Modular MVC Architecture',
            },
          },
          {
            title: {
              ar: 'بناء مسارات RESTful APIs ومعالجة الطلبات والاستجابات',
              en: 'Building RESTful Endpoints, Routing, and Payload Handling',
            },
          },
          {
            title: {
              ar: 'البرمجيات الوسيطة (Middlewares) والتحقق من صحة المدخلات عبر Zod',
              en: 'Custom Middlewares and Input Validation with Zod',
            },
          },
          {
            title: {
              ar: 'مشروع عملي: بناء نظام مصادقة كامل وتأمين الـ Endpoints عبر JWT',
              en: 'Hands-on Project: JWT Authentication & Endpoint Security',
            },
          },
        ],
      },
    ],
  },

  // 2. Laravel & RESTful APIs
  'mastering-laravel-restful-apis-performance': {
    title: {
      ar: 'احترف إطار العمل Laravel وبناء واجهات RESTful APIs عالية الأداء',
      en: 'Mastering Laravel & High-Performance RESTful APIs',
    },
    subtitle: {
      ar: 'دليلك المتكامل لإتقان Laravel 11، هندسة البيانات بـ Eloquent، المعالجة غير المتزامنة بـ Queues، وتأمين الخدمات.',
      en: 'Comprehensive guide to Laravel 11, advanced Eloquent ORM, asynchronous queues, caching, and API security.',
    },
    description: {
      ar: `يُعد إطار عمل Laravel الخيار الأول لبناء تطبيقات الويب الحديثة والمعقدة في كبرى الشركات.

ستتعلم في هذه الدورة كيفية استغلال إمكانيات Laravel المتقدمة لبناء أنظمة سريعة، منظمة ومبنية وفق معايير Clean Architecture، بدءاً من العلاقات وقواعد البيانات وحتى التحسين وتخزين الكاش في Redis.`,
      en: `Laravel is the leading framework for building modern enterprise web applications. Learn how to architect clean, scalable backends with advanced Eloquent, asynchronous queues, and Redis caching.`,
    },
    category: {
      ar: 'قواعد البيانات وهندسة الـ Backend',
      en: 'Databases & Backend',
    },
    instructor: {
      name: {
        ar: 'م. سارة منصور',
        en: 'Eng. Sarah Mansour',
      },
      headline: {
        ar: 'مهندسة برمجيات أولى ومدربة تطوير واجهات',
        en: 'Senior Backend Engineer & Instructor',
      },
      bio: {
        ar: 'مهندسة برمجيات متخصصة في بنى Laravel السحابية وقواعد البيانات الضخمة.',
        en: 'Senior software architect specialized in enterprise Laravel cloud architectures and distributed database systems.',
      },
    },
    level: {
      ar: 'متقدم',
      en: 'Advanced',
    },
    outcomes: {
      ar: [
        'تصميم وهيكلة واجهات API احترافية تدعم المعايير العالمية',
        'إتقان Eloquent ORM وتحسين استعلامات قواعد البيانات ومنع مشاكل N+1',
        'إدارة المهام الخلفية وخطوط الانتظار Queues والتنبيهات المباشرة',
        'تطبيق أفضل ممارسات الأمان والتوثيق عبر Sanctum و Passport',
      ],
      en: [
        'Design and architect enterprise-standard RESTful APIs',
        'Master Eloquent ORM, complex queries, and resolve N+1 bottlenecks',
        'Manage background jobs, asynchronous queues, and real-time events',
        'Apply industry-grade security and authentication via Sanctum',
      ],
    },
    requirements: {
      ar: [
        'معرفة بأساسيات لغة PHP والبرمجة كائنية التوجه (OOP)',
        'فهم أساسي لقواعد بيانات SQL وتصميم الجداول',
      ],
      en: [
        'Understanding of PHP fundamentals and Object-Oriented Programming (OOP)',
        'Basic familiarity with SQL databases and table schemas',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: معمارية Laravel الحديثة وهندسة الخدمات',
          en: 'Module 1: Modern Laravel Architecture & Service Container',
        },
        lessons: [
          {
            title: {
              ar: 'مقدمة وهيكلة Laravel 11 ومفهوم Service Container',
              en: 'Laravel 11 Project Structure and Service Container Essentials',
            },
          },
          {
            title: {
              ar: 'إتقان العلاقات المتقدمة في Eloquent ORM وتحسين الاستعلامات',
              en: 'Advanced Eloquent Relationships & Query Optimization',
            },
          },
          {
            title: {
              ar: 'بناء API Resources وتوحيد شكل الاستجابات JSON',
              en: 'Building API Resources & Standardizing JSON Responses',
            },
          },
        ],
      },
    ],
  },

  // 3. UI/UX Figma Diploma
  'ui-ux-design-mastery-figma-diploma': {
    title: {
      ar: 'دبلومة تصميم تجربة وواجهة المستخدم الشاملة باستخدام Figma',
      en: 'Complete UI/UX Design & Design Systems Mastery with Figma',
    },
    subtitle: {
      ar: 'من أبحاث المستخدم ورسم الـ Wireframes إلى تصميم واجهات تفاعلية وأنظمة تصميم احترافية جاهزة للتطوير.',
      en: 'From user research and wireframing to responsive design systems, interactive prototypes, and developer handoff in Figma.',
    },
    description: {
      ar: `تصميم تجربة المستخدم (UI/UX) هو الفارق بين التطبيقات الناجحة والتطبيقات المهجورة.

في هذه الدبلومة الشاملة، ستخوض رحلة عملية متكاملة تبدأ من فهم المشاكل الحقيقية وسلوك المستخدمين، مروراً بهيكلة المعلومات ورسم النماذج الأولية، وانتهاءً بتصميم واجهات فائقة الجاذبية باستخدام أقوى ميزات Figma مثل Auto Layout و Components و Variables.`,
      en: `UI/UX design is the foundation of digital product success. This comprehensive diploma takes you from user research and information architecture to high-fidelity interactive prototypes and scalable design systems in Figma.`,
    },
    category: {
      ar: 'تصميم واجهات وتجربة المستخدم UI/UX',
      en: 'UI/UX Design',
    },
    instructor: {
      name: {
        ar: 'أ. نور الهدى إبراهيم',
        en: 'Nour El-Hoda Ibrahim',
      },
      headline: {
        ar: 'رئيسة قسم تصميم تجربة المستخدم وأنظمة التصميم',
        en: 'Lead Product Designer & Design Systems Specialist',
      },
      bio: {
        ar: 'قادت تصميم تجارب رقمية لأكثر من 50 منتجاً وتطبيقاً ناجحاً مع التركيز على أبحاث المستخدم وبناء أنظمة تصميم شاملة.',
        en: 'Led product design for 50+ successful digital platforms with a focus on human-centered research and scalable Design Systems.',
      },
    },
    level: {
      ar: 'مبتدئ',
      en: 'Beginner',
    },
    outcomes: {
      ar: [
        'إجراء أبحاث المستخدم وبناء شخصيات الاستخدام (User Personas)',
        'رسم Wireframes دقيقة وهندسة تجربة استخدام سلسة',
        'إتقان أدوات Figma المتقدمة (Auto Layout, Design Tokens, Components)',
        'بناء Portfolio شخصي يحتوي على 3 مشاريع واقعية مدروسة',
      ],
      en: [
        'Conduct user research, journey mapping, and define user personas',
        'Create intuitive wireframes and seamless information architectures',
        'Master advanced Figma features (Auto Layout, Design Tokens, Components)',
        'Build a professional portfolio featuring 3 end-to-end case studies',
      ],
    },
    requirements: {
      ar: [
        'لا يشترط وجود أي خبرة سابقة في التصميم أو الرسم',
        'حساب مجاني على موقع Figma وجهاز حاسوب',
      ],
      en: [
        'No prior design or sketching experience required',
        'A free Figma account and a computer',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: مبادئ تجربة المستخدم (UX Principles) وسلوك المستفيد',
          en: 'Module 1: UX Principles & Human-Centered Design',
        },
        lessons: [
          {
            title: {
              ar: 'ما هو الفرق بين UI و UX وكيف يفكر مصمم المنتجات؟',
              en: 'UI vs. UX: Mindset & Roles of a Product Designer',
            },
          },
          {
            title: {
              ar: 'قوانين تجربة المستخدم العالمية (Laws of UX) وتطبيقاتها العملية',
              en: 'Laws of UX and Practical Digital Heuristics',
            },
          },
          {
            title: {
              ar: 'أدوات Figma الأساسية: Frames و Shapes و Constraints',
              en: 'Core Figma Tools: Frames, Vector Shapes, and Constraints',
            },
          },
        ],
      },
    ],
  },

  // 4. AI & Machine Learning with Python
  'artificial-intelligence-machine-learning-python': {
    title: {
      ar: 'الذكاء الاصطناعي وتطبيقات تعلم الآلة باستخدام Python',
      en: 'Artificial Intelligence & Machine Learning with Python',
    },
    subtitle: {
      ar: 'انطلق في عالم الـ AI: بناء وتدريب وتقييم نماذج تعلم الآلة ومعالجة البيانات الضخمة وبناء تطبيقات عملية.',
      en: 'Step into AI: Train predictive models, process large datasets, and build intelligent machine learning applications with Python.',
    },
    description: {
      ar: `يُشكل الذكاء الاصطناعي الثورة التقنية الأكبر في عصرنا الحالي.

ستتعلم في هذا الكورس كيفية استخدام لغة Python ومكتباتها القياسية (NumPy, Pandas, Scikit-Learn, Matplotlib) لتحليل البيانات، وتدريب نماذج التنبؤ والتصنيف والانحدار، وفهم الرياضيات والخوارزميات الكامنة وراء الذكاء الاصطناعي بأسلوب عملي مبسط.`,
      en: `Master the principles of Artificial Intelligence and Machine Learning using Python, NumPy, Pandas, Scikit-Learn, and real-world datasets.`,
    },
    category: {
      ar: 'تعلم الآلة والذكاء الاصطناعي',
      en: 'Machine Learning & AI',
    },
    instructor: {
      name: {
        ar: 'د. أحمد الشناوي',
        en: 'Dr. Ahmed El-Shinawy',
      },
      headline: {
        ar: 'استشاري ذكاء اصطناعي وعلم بيانات',
        en: 'AI Consultant & Data Science Researcher',
      },
      bio: {
        ar: 'دكتوراه في علوم البيانات وخبير بناء وتدريب النماذج التنبؤية والتعلم العميق.',
        en: 'PhD in Data Science with extensive background in predictive machine learning models and deep neural networks.',
      },
    },
    level: {
      ar: 'متوسط',
      en: 'Intermediate',
    },
    outcomes: {
      ar: [
        'تنظيف واستكشاف وهندسة البيانات الإحصائية المعقدة',
        'بناء نماذج التعلم الخاضع للإشراف وغير الخاضع للإشراف (Supervised & Unsupervised)',
        'تقييم النماذج بدقة وتجنب ظاهرة الـ Overfitting',
        'نشر نماذج الذكاء الاصطناعي كواجهات API برمجية للاستخدام المباشر',
      ],
      en: [
        'Clean, preprocess, and engineer complex statistical datasets',
        'Train supervised and unsupervised machine learning models',
        'Evaluate models accurately and prevent overfitting',
        'Deploy trained AI models as production REST APIs',
      ],
    },
    requirements: {
      ar: [
        'معرفة بأساسيات لغة Python والمتغيرات والدوال',
        'مفاهيم رياضية وإحصائية أساسية (المتوسط، الجبر الخطي البسيط)',
      ],
      en: [
        'Familiarity with basic Python syntax and data structures',
        'Basic arithmetic and statistical concepts',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: معالجة البيانات واستكشافها باستخدام Pandas و NumPy',
          en: 'Module 1: Exploratory Data Analysis with NumPy & Pandas',
        },
        lessons: [
          {
            title: {
              ar: 'البيئة التحليلية عبر Jupyter Notebooks وأساسيات المصفوفات في NumPy',
              en: 'Jupyter Analytics Environment and Vector Math in NumPy',
            },
          },
          {
            title: {
              ar: 'معالجة وتنظيف الجداول الإحصائية المفقودة باستخدام مكتبة Pandas',
              en: 'Data Wrangling, Cleaning, and Missing Value Handling in Pandas',
            },
          },
        ],
      },
    ],
  },

  // 5. Ethical Hacking & Cyber Security
  'ethical-hacking-cybersecurity-fundamentals': {
    title: {
      ar: 'أساسيات الأمن السيبراني واختبار الاختراق الأخلاقي (Ethical Hacking)',
      en: 'Ethical Hacking & Cybersecurity Fundamentals',
    },
    subtitle: {
      ar: 'تعلم منهجية التفكير الأمني، فحص الثغرات، اختبار اختراق الشبكات وتطبيقات الويب، وحماية البنى الرقمية.',
      en: 'Learn offensive and defensive cybersecurity, penetration testing methodologies, network auditing, and web app defense.',
    },
    description: {
      ar: `مع تزايد الهجمات الإلكترونية، أصبح تأمين التطبيقات والشبكات ضرورة قصوى لجميع المؤسسات.

يقودك هذا الكورس العملي عبر بيئات اختبار اختراق حقيقية ومصرح بها (Virtual Labs) لتتعلم كيف يكتشف المهاجمون الثغرات وكيف يقوم مهندسو الأمن السيبراني بسدها وحماية البيانات الحساسة.`,
      en: `Step into ethical hacking and cyber defense with hands-on virtual security labs covering vulnerability assessment, network scanning, and web security.`,
    },
    category: {
      ar: 'أساسيات الأمن واختبار الاختراق',
      en: 'Cyber Security & Hacking',
    },
    instructor: {
      name: {
        ar: 'م. طارق العوضي',
        en: 'Eng. Tarek El-Awady',
      },
      headline: {
        ar: 'خبير أمن سيبراني واختبار اختراق OSCP & CEH',
        en: 'Cybersecurity Consultant (OSCP & CEH)',
      },
      bio: {
        ar: 'مستشار أمني ساهم في تدقيق واختبار بنى رقمية كبرى وتأمين الخدمات السحابية.',
        en: 'Certified security consultant with extensive experience auditing digital infrastructure and mitigating vulnerabilities.',
      },
    },
    level: {
      ar: 'مبتدئ',
      en: 'Beginner',
    },
    outcomes: {
      ar: [
        'إتقان استخدام نظام Kali Linux وأدوات الفحص الأمني مثل Nmap و Wireshark',
        'فحص وتحديد ثغرات تطبيقات الويب الشائعة وفق تصنيف OWASP Top 10',
        'كتابة تقارير أمنية احترافية واقتراح حلول تصحيحية للمطورين',
        'تأمين الأنظمة وتطبيق إجراءات الدفاع بالعمق (Defense-in-Depth)',
      ],
      en: [
        'Master Kali Linux utilities including Nmap, Wireshark, and Metasploit',
        'Audit web applications against OWASP Top 10 vulnerabilities',
        'Draft professional vulnerability assessment reports',
        'Implement defense-in-depth protocols to safeguard infrastructure',
      ],
    },
    requirements: {
      ar: [
        'فهم أساسي لمبادئ عمل الشبكات وبروتوكول TCP/IP',
        'جهاز حاسوب يدعم تشغيل الأنظمة الوهمية (VirtualBox أو VMware)',
      ],
      en: [
        'Basic understanding of networking and TCP/IP protocols',
        'Computer capable of running virtualization (VirtualBox / VMware)',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: أساسيات الشبكات والبيئة المعملية لاختبار الاختراق',
          en: 'Module 1: Networking Basics & Security Lab Setup',
        },
        lessons: [
          {
            title: {
              ar: 'تثبيت بيئة Kali Linux وبناء المعمل الأمني الآمن',
              en: 'Setting up Kali Linux Virtual Testing Environment',
            },
          },
          {
            title: {
              ar: 'فحص المنافذ والخدمات النشطة باستخدام Nmap باحترافية',
              en: 'Port Auditing & Service Discovery with Nmap',
            },
          },
        ],
      },
    ],
  },

  // 6. Docker, Kubernetes & CI/CD
  'docker-kubernetes-devops-pipeline-mastery': {
    title: {
      ar: 'احتراف Docker و Kubernetes وهندسة خطوط النشر الآلي CI/CD',
      en: 'Docker, Kubernetes & CI/CD DevOps Pipeline Mastery',
    },
    subtitle: {
      ar: 'احترف تقنيات الحاويات وإدارتها على نطاق واسع وأتمتة اختبار ونشر البرمجيات على الخوادم السحابية.',
      en: 'Master containerization with Docker, orchestration with Kubernetes, and automated deployment pipelines with GitHub Actions.',
    },
    description: {
      ar: `تعتمد الشركات الرائدة عالمياً على تقنيات DevOps لتسريع إطلاق المنتجات وضمان استقرار الخوادم تحت الضغط العالي.

في هذه الدورة المتقدمة، ستتعلم كيفية تحويل التطبيقات إلى حاويات خفيفة باستخدام Docker، وتوزيعها وإدارتها تلقائياً عبر Kubernetes، وبناء خطوط تكامل ونشر مستمر (CI/CD) بالكامل باستخدام GitHub Actions.`,
      en: `Learn how modern engineering teams automate container workflows with Docker, scale with Kubernetes clusters, and ship code safely with CI/CD automation.`,
    },
    category: {
      ar: 'أدوات الحاويات Docker & Kubernetes',
      en: 'Cloud & DevOps',
    },
    instructor: {
      name: {
        ar: 'م. كريم عبد العزيز',
        en: 'Eng. Karim Abdelaziz',
      },
      headline: {
        ar: 'مهندس حلول سحابية وخبير DevOps',
        en: 'Cloud Solutions Architect & DevOps Lead',
      },
      bio: {
        ar: 'متخصص في بناء وإدارة مصفوفات Kubernetes وخطوط النشر الآلي المستمرة.',
        en: 'Cloud architect specializing in multi-region Kubernetes clusters and enterprise CI/CD automation pipelines.',
      },
    },
    level: {
      ar: 'متقدم',
      en: 'Advanced',
    },
    outcomes: {
      ar: [
        'بناء ملفات Dockerfile وصور حاويات محسنة وصغيرة الحجم',
        'إدارة مصفوفات الخدمات باستخدام Docker Compose',
        'نشر التطبيقات وإدارتها عبر مصفوفات Kubernetes (Pods, Deployments, Services)',
        'أتمتة الفحص والاختبار والنشر إلى السحابة عبر GitHub Actions CI/CD',
      ],
      en: [
        'Author lightweight, multi-stage production Dockerfiles',
        'Orchestrate local microservices using Docker Compose',
        'Deploy and manage scalable workloads on Kubernetes clusters',
        'Build automated CI/CD build and test pipelines with GitHub Actions',
      ],
    },
    requirements: {
      ar: [
        'معرفة بأساسيات أوامر Linux والتعامل مع الطرفية (Terminal)',
        'خبرة في بناء تطبيق ويب بأي لغة برمجية (Node.js, PHP, Python)',
      ],
      en: [
        'Familiarity with Linux command line and basic networking',
        'Experience building a web app in Node.js, PHP, or Python',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: أسس الحاويات وبناء صور Docker عالية الكفاءة',
          en: 'Module 1: Container Foundations & Efficient Docker Images',
        },
        lessons: [
          {
            title: {
              ar: 'ما هي الحاويات وما الفرق بينها وبين الأجهزة الافتراضية (VMs)؟',
              en: 'Containers vs. Virtual Machines Explained',
            },
          },
          {
            title: {
              ar: 'كتابة Dockerfile احترافي يدعم Multi-stage Builds لتقليل الحجم',
              en: 'Writing Multi-Stage Dockerfiles for Production',
            },
          },
        ],
      },
    ],
  },

  // 7. Digital Marketing & SEO
  'comprehensive-digital-marketing-seo-strategy': {
    title: {
      ar: 'دليل التسويق الرقمي المتكامل وتحسين محركات البحث SEO',
      en: 'Comprehensive Digital Marketing & SEO Strategy',
    },
    subtitle: {
      ar: 'استراتيجيات تصدر نتائج البحث، إدارة ميزانيات الإعلانات، وبناء حملات تسويقية تحقق أعلى عوائد استثمارية.',
      en: 'Proven strategies for organic search ranking, paid acquisition campaigns, GA4 analytics, and high-ROI conversion funnels.',
    },
    description: {
      ar: `التسويق الرقمي ليس مجرد نشر منشورات عشوائية، بل هو علم واستراتيجية دقيقة تعتمد على فهم الجمهور المستهدف وتحليل البيانات.

تغطي هذه الدورة العملية كل ما تحتاجه لتصبح مسوقاً رقمياً محترفاً، من تحسين محركات البحث (On-Page & Off-Page SEO) وإعلانات Google وتتبع التحويلات عبر Google Analytics 4، إلى بناء مسارات تحويل عملاء متكاملة.`,
      en: `Master modern growth and performance marketing from search engine optimization and Google Ads to funnel analytics with GA4.`,
    },
    category: {
      ar: 'تحسين محركات البحث SEO',
      en: 'Digital Marketing',
    },
    instructor: {
      name: {
        ar: 'أ. ياسمين فاروق',
        en: 'Yasmine Farouk',
      },
      headline: {
        ar: 'استشارية تسويق رقمي ونمو أعمال',
        en: 'Digital Growth Strategist & SEO Consultant',
      },
      bio: {
        ar: 'خبيرة نمو رقمي أدارت حملات تسويقية وتصدرت مئات الكلمات التنافسية على محركات البحث.',
        en: 'Digital marketing strategist managing multi-channel paid acquisition and leading search engine ranking campaigns.',
      },
    },
    level: {
      ar: 'مبتدئ',
      en: 'Beginner',
    },
    outcomes: {
      ar: [
        'إجراء بحث دقيق عن الكلمات المفتاحية وتحليل المنافسين',
        'تهيئة المواقع والمتاجر لتصدر نتائج بحث Google العضوية',
        'إطلاق وإدارة حملات Google Ads الإعلانية بأعلى كفاءة',
        'قراءة وتفسير لوحات تحليلات GA4 وحساب العائد على الاستثمار (ROI)',
      ],
      en: [
        'Conduct keyword research and in-depth competitor auditing',
        'Optimize websites to rank organically on Google Search',
        'Launch and optimize high-converting Google Ads campaigns',
        'Track conversion funnels and analyze ROI in Google Analytics 4',
      ],
    },
    requirements: {
      ar: [
        'معرفة باستخدام الإنترنت وبرامج التصفح الحديثة',
        'رغبة في تنمية المبيعات والمشاريع عبر القنوات الرقمية',
      ],
      en: [
        'Basic web browsing literacy',
        'Desire to grow online traffic and conversions',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: استراتيجية تحسين محركات البحث (SEO Foundations)',
          en: 'Module 1: SEO Foundations & Search Algorithms',
        },
        lessons: [
          {
            title: {
              ar: 'كيف تعمل خوارزميات محركات البحث وعوامل الترتيب الأساسية',
              en: 'How Search Engines Crawl, Index, and Rank Content',
            },
          },
          {
            title: {
              ar: 'دليل عملي: كتابة محتوى متوافق مع معايير SEO وتنسيق العناوين والروابط',
              en: 'Practical On-Page SEO Checklist & Content Formatting',
            },
          },
        ],
      },
    ],
  },

  // 8. Startups & Entrepreneurship
  'startup-launch-from-idea-to-investment': {
    title: {
      ar: 'بناء وإطلاق الشركات الناشئة من الفكرة إلى أول جولة استثمارية',
      en: 'Building & Launching Startups: From Idea to Seed Round',
    },
    subtitle: {
      ar: 'دليلك الريادي للتحقق من الأفكار، بناء نموذج العمل التجاري، تصميم المنتج الأولي MVP، والتفاوض مع المستثمرين.',
      en: 'Founder playbook: Market validation, Business Model Canvas, Lean MVP launch, and pitch deck fundraising.',
    },
    description: {
      ar: `تحويل فكرة مبتكرة إلى شركة ناشئة ناجحة وقابلة للتوسع يتطلب منهجية واضحة لتفادي الأخطاء القاتلة.

يقدم لك هذا البرنامج دليلاً خطوة بخطوة يبدأ من دراسة الجدوى ومقابلة العملاء المحتملين، وتطبيق منهجية Lean Startup لبناء الـ MVP بأقل تكلفة، ثم تقييم الشركة وتجهيز عرض الاستثمار (Pitch Deck) لعرضه على الصناديق الاستثمارية.`,
      en: `A step-by-step founder guide to validating customer demand, defining scalable business models, launching MVPs, and pitching investors.`,
    },
    category: {
      ar: 'بناء وإطلاق الشركات الناشئة',
      en: 'Entrepreneurship',
    },
    instructor: {
      name: {
        ar: 'أ. عمر خالد',
        en: 'Omar Khaled',
      },
      headline: {
        ar: 'مستثمر ومؤسس شركات ناشئة',
        en: 'Venture Builder & Early-Stage Investor',
      },
      bio: {
        ar: 'مؤسس لثلاث شركات ناشئة ومستثمر ملائكي في قطاع التكنولوجيا والتعليم.',
        en: 'Serial founder of 3 tech startups and active angel investor in high-growth EdTech and FinTech ventures.',
      },
    },
    level: {
      ar: 'مبتدئ',
      en: 'Beginner',
    },
    outcomes: {
      ar: [
        'التحقق من الفكرة وملاءمتها لاحتياج السوق (Problem-Solution Fit)',
        'بناء وتعبئة نموذج العمل التجاري (Business Model Canvas)',
        'تخطيط وإطلاق المنتج الأولي بأقل جهد وتكلفة (MVP)',
        'إعداد العرض الاستثماري وحساب المؤشرات المالية والتقييم',
      ],
      en: [
        'Validate problem-solution fit and customer willingness to pay',
        'Structure and iterate on the Business Model Canvas',
        'Design and launch low-code / no-code lean MVPs',
        'Prepare investor pitch decks and financial unit metrics',
      ],
    },
    requirements: {
      ar: [
        'فكرة مشروع أو رغبة جادة في دخول عالم ريادة الأعمال',
        'الاستعداد لتطبيق المهام والتفاعل مع العملاء الفعليين في السوق',
      ],
      en: [
        'An early startup idea or passion for entrepreneurship',
        'Readiness to talk to real customers in the market',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: تقييم الفكرة والتحقق من احتياج السوق',
          en: 'Module 1: Idea Validation & Market Need Verification',
        },
        lessons: [
          {
            title: {
              ar: 'كيف تفرز الأفكار الواعدة وتتأكد من وجود مشكلة تستحق الحل؟',
              en: 'How to Filter Winning Startup Ideas from Noise',
            },
          },
          {
            title: {
              ar: 'نموذج العمل التجاري (Business Model Canvas) خطوة بخطوة',
              en: 'Step-by-Step Business Model Canvas Blueprint',
            },
          },
        ],
      },
    ],
  },

  // 9. Agile & Scrum Project Management
  'project-management-agile-scrum-mastery': {
    title: {
      ar: 'إدارة المشاريع الاحترافية وتطبيق منهجيات Agile و Scrum',
      en: 'Professional Project Management: Agile & Scrum Mastery',
    },
    subtitle: {
      ar: 'اكتسب مهارات قيادة وتنسيق المشاريع، إدارة الأولويات، وتطبيق أطر العمل المرنة لتحقيق أعلى إنتاجية.',
      en: 'Lead engineering and product teams with agile project workflows, sprint ceremonies, backlog prioritization, and risk management.',
    },
    description: {
      ar: `في بيئة العمل المتسارعة اليوم، أصبحت مهارات إدارة المشاريع والعمل المرن من أكثر المهارات طلباً لدى الشركات العالمية.

تمنحك هذه الدورة إتقاناً عملياً لكيفية إدارة دورة حياة المشروع من البداية وحتى التسليم، وتطبيق اجتماعات Scrum وأدوات التتبع مثل Jira، وإدارة المخاطر وتوقعات أصحاب المصلحة.`,
      en: `Gain practical mastery of Agile and Scrum frameworks, backlog refinement, sprint planning, productivity tracking, and stakeholder communication.`,
    },
    category: {
      ar: 'إدارة المشاريع الاحترافية Agile',
      en: 'Project Management',
    },
    instructor: {
      name: {
        ar: 'م. حسام الدين عبد الله',
        en: 'Eng. Hossam Abdullah',
      },
      headline: {
        ar: 'مدير مشاريع تقنية PMP & Agile Coach',
        en: 'Technical Project Director (PMP & Agile Coach)',
      },
      bio: {
        ar: 'مدرب معتمد قاد فرق تطوير برمجيات عالمية لتسليم مشاريع رقمية كبرى.',
        en: 'Certified PMP & Agile Coach leading enterprise engineering teams to deliver high-impact digital initiatives.',
      },
    },
    level: {
      ar: 'مبتدئ',
      en: 'Beginner',
    },
    outcomes: {
      ar: [
        'تطبيق مبادئ وممارسات إطار العمل Scrum و Kanban بكفاءة',
        'إدارة وتخطيط السبرنتات (Sprint Planning & Retrospectives)',
        'استخدام أدوات إدارة المهام وتتبع الإنتاجية الحديثة',
        'التعامل مع مخاطر المشاريع وتنسيق العمل مع الفرق متعددة التخصصات',
      ],
      en: [
        'Implement Scrum and Kanban workflows effectively',
        'Run sprint planning, daily standups, and retrospectives',
        'Track team velocity and productivity metrics in Jira',
        'Mitigate cross-functional project bottlenecks and risks',
      ],
    },
    requirements: {
      ar: [
        'لا توجد متطلبات مسبقة معقدة',
        'الرغبة في تطوير مهارات التخطيط والقيادة والتنظيم',
      ],
      en: [
        'No specialized prerequisites required',
        'Desire to master planning, coordination, and team leadership',
      ],
    },
    sections: [
      {
        title: {
          ar: 'الوحدة الأولى: أسس ومبادئ الإدارة الرشيقة للمشاريع (Agile Foundations)',
          en: 'Module 1: Agile Manifesto & Scrum Fundamentals',
        },
        lessons: [
          {
            title: {
              ar: 'مقارنة بين المنهجية التقليدية (Waterfall) والمنهجية المرنة (Agile)',
              en: 'Waterfall vs. Agile: When to Use Which Methodology',
            },
          },
          {
            title: {
              ar: 'أدوار فريق الـ Scrum: مالك المنتج والـ Scrum Master وفريق التطوير',
              en: 'Scrum Team Roles: Product Owner, Scrum Master, and Developers',
            },
          },
        ],
      },
    ],
  },
}

/**
 * Returns a deep copy of a course localized to the target language.
 */
export function getLocalizedCourse(course: Course, lang: AppLanguage): Course {
  const entry = LOCALIZED_CATALOG[course.slug]

  if (!entry) {
    return course
  }

  const categoryName = entry.category[lang] ?? (course.category ? getLocalizedCategoryName(course.category, lang) : '')
  const instructorName = entry.instructor.name[lang] ?? course.instructor?.name ?? ''
  const levelLabel = entry.level[lang] ?? course.level_label

  return {
    ...course,
    title: entry.title[lang] ?? course.title,
    subtitle: entry.subtitle[lang] ?? course.subtitle,
    level_label: levelLabel,
    category: course.category
      ? {
          ...course.category,
          name: categoryName,
        }
      : undefined,
    instructor: course.instructor
      ? {
          ...course.instructor,
          name: instructorName,
          headline: entry.instructor.headline?.[lang] ?? course.instructor.headline,
          bio: entry.instructor.bio?.[lang] ?? course.instructor.bio,
        }
      : undefined,
  }
}

/**
 * Returns a deep copy of CourseDetail with localized sections and lessons.
 */
export function getLocalizedCourseDetail(detail: CourseDetail, lang: AppLanguage): CourseDetail {
  const localizedCourse = getLocalizedCourse(detail, lang)
  const entry = LOCALIZED_CATALOG[detail.slug]

  let localizedSections: Section[] = detail.sections ?? []

  if (entry?.sections && detail.sections) {
    localizedSections = detail.sections.map((sec: Section, sIdx: number) => {
      const secEntry = entry.sections?.[sIdx]
      return {
        ...sec,
        title: secEntry?.title[lang] ?? sec.title,
        lessons: (sec.lessons ?? []).map((lesson: Lesson, lIdx: number) => {
          const lessonEntry = secEntry?.lessons?.[lIdx]
          return {
            ...lesson,
            title: lessonEntry?.title[lang] ?? lesson.title,
            content: lessonEntry?.content?.[lang] ?? lesson.content,
          }
        }),
      }
    })
  }

  return {
    ...detail,
    ...localizedCourse,
    description: entry?.description[lang] ?? detail.description,
    outcomes: entry?.outcomes[lang] ?? detail.outcomes,
    requirements: entry?.requirements[lang] ?? detail.requirements,
    sections: localizedSections,
  }
}

/**
 * Localizes CourseDetailPage payload { course: CourseDetail, related: Course[], ratingBreakdown: RatingBreakdown }
 */
export function getLocalizedCourseOverview(
  data: { course: CourseDetail; related: Course[]; ratingBreakdown: RatingBreakdown },
  lang: AppLanguage,
): { course: CourseDetail; related: Course[]; ratingBreakdown: RatingBreakdown } {
  return {
    course: getLocalizedCourseDetail(data.course, lang),
    related: data.related.map((c) => getLocalizedCourse(c, lang)),
    ratingBreakdown: data.ratingBreakdown,
  }
}

/**
 * Localizes CoursePlayer payload
 */
export function getLocalizedCoursePlayer(player: CoursePlayer, lang: AppLanguage): CoursePlayer {
  const localizedCourse = getLocalizedCourseDetail(player.course, lang)
  const entry = LOCALIZED_CATALOG[player.course.slug]

  let currentLesson = player.current_lesson
  if (currentLesson && entry?.sections) {
    for (const sec of entry.sections) {
      for (const les of sec.lessons) {
        if (les.title.ar === currentLesson.title || les.title.en === currentLesson.title) {
          currentLesson = {
            ...currentLesson,
            title: les.title[lang],
            content: les.content ? les.content[lang] : currentLesson.content,
          }
          break
        }
      }
    }
  }

  let nextLesson = player.next_lesson
  if (nextLesson && entry?.sections) {
    for (const sec of entry.sections) {
      for (const les of sec.lessons) {
        if (les.title.ar === nextLesson.title || les.title.en === nextLesson.title) {
          nextLesson = {
            ...nextLesson,
            title: les.title[lang],
          }
          break
        }
      }
    }
  }

  let prevLesson = player.previous_lesson
  if (prevLesson && entry?.sections) {
    for (const sec of entry.sections) {
      for (const les of sec.lessons) {
        if (les.title.ar === prevLesson.title || les.title.en === prevLesson.title) {
          prevLesson = {
            ...prevLesson,
            title: les.title[lang],
          }
          break
        }
      }
    }
  }

  return {
    ...player,
    course: localizedCourse,
    current_lesson: currentLesson,
    next_lesson: nextLesson,
    previous_lesson: prevLesson,
  }
}

/**
 * React Hooks for auto-localizing courses according to current UI language
 */
export function useLocalizedCourse(course: Course | null | undefined): Course | null | undefined {
  const language = useLanguage()
  if (!course) return course
  return getLocalizedCourse(course, language)
}

export function useLocalizedCourses(courses: Course[] | null | undefined): Course[] {
  const language = useLanguage()
  if (!courses) return []
  return courses.map((c) => getLocalizedCourse(c, language))
}
