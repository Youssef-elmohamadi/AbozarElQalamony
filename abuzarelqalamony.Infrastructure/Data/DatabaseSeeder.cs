using abuzarelqalamony.Application.Interfaces;
using abuzarelqalamony.Domain.Entities;
using abuzarelqalamony.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace abuzarelqalamony.Infrastructure.Data
{
    public static class DatabaseSeeder
    {
        public static async Task<string> SeedAsync(ApplicationDbContext context, IHashPassword passwordHasher, bool force = false)
        {
            int addedUsers = 0;
            int addedCategories = 0;
            int addedBooks = 0;
            int addedLessons = 0;
            int addedSermons = 0;
            int addedArticles = 0;
            int addedAlerts = 0;

            var now = DateTime.UtcNow;
            var thisMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var lastMonth = thisMonthStart.AddMonths(-1);
            var nextMonth = thisMonthStart.AddMonths(1);

            // =========================================================================
            // 1. Roles
            // =========================================================================
            Role? adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole is null)
            {
                adminRole = new Role { Name = "Admin" };
                await context.Roles.AddAsync(adminRole);
                await context.SaveChangesAsync();
            }

            Role? userRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (userRole is null)
            {
                userRole = new Role { Name = "User" };
                await context.Roles.AddAsync(userRole);
                await context.SaveChangesAsync();
            }

            // =========================================================================
            // 2. Users
            // =========================================================================
            if (!await context.Users.AnyAsync(u => u.Email == "admin@abuzar.com"))
            {
                await context.Users.AddAsync(new User
                {
                    Name = "فضيلة الشيخ أبو ذر القلموني",
                    Email = "admin@abuzar.com",
                    PasswordHash = passwordHasher.HashPassword("Admin@123456"),
                    ProfileImagePath = "/uploads/users/sheikh-avatar.jpg",
                    RoleId = adminRole.Id
                });
                addedUsers++;
            }

            if (!await context.Users.AnyAsync(u => u.Email == "editor@abuzar.com"))
            {
                await context.Users.AddAsync(new User
                {
                    Name = "مشرف المنصة الدعوية",
                    Email = "editor@abuzar.com",
                    PasswordHash = passwordHasher.HashPassword("Editor@123456"),
                    ProfileImagePath = null,
                    RoleId = adminRole.Id
                });
                addedUsers++;
            }

            if (!await context.Users.AnyAsync(u => u.Email == "student@abuzar.com"))
            {
                await context.Users.AddAsync(new User
                {
                    Name = "طالب علم ومحب",
                    Email = "student@abuzar.com",
                    PasswordHash = passwordHasher.HashPassword("User@123456"),
                    ProfileImagePath = null,
                    RoleId = userRole.Id
                });
                addedUsers++;
            }

            await context.SaveChangesAsync();

            // =========================================================================
            // Helper: Get or Create Category
            // =========================================================================
            async Task<Category> GetOrCreateCategoryAsync(string name, CategoryType type, int? parentId = null)
            {
                var existing = await context.Categories
                    .FirstOrDefaultAsync(c => c.Name == name && c.Type == type);

                if (existing != null)
                    return existing;

                var newCat = new Category
                {
                    Name = name,
                    Type = type,
                    ParentId = parentId
                };

                await context.Categories.AddAsync(newCat);
                await context.SaveChangesAsync();
                addedCategories++;
                return newCat;
            }

            // =========================================================================
            // 3. Categories (Main & Sub Categories)
            // =========================================================================
            // Lesson categories
            var catTazkiyah = await GetOrCreateCategoryAsync("سلاسل التزكية والرقائق", CategoryType.Lesson);
            var catAqeedah = await GetOrCreateCategoryAsync("العقيدة وأصول الإيمان", CategoryType.Lesson);
            var catFiqh = await GetOrCreateCategoryAsync("فقه العبادات والمعاملات", CategoryType.Lesson);
            var catSeerah = await GetOrCreateCategoryAsync("السيرة النبوية والشمائل", CategoryType.Lesson);
            await GetOrCreateCategoryAsync("أبحاث ودراسات فكرية معاصرة", CategoryType.Lesson); // Empty category for dashboard

            var subFafirru = await GetOrCreateCategoryAsync("شرح كتاب ففروا إلى الله", CategoryType.Lesson, catTazkiyah.Id);
            var subAmradh = await GetOrCreateCategoryAsync("أمراض القلوب وعلاجها", CategoryType.Lesson, catTazkiyah.Id);
            var subMaqamat = await GetOrCreateCategoryAsync("مقامات السائرين إلى الله", CategoryType.Lesson, catTazkiyah.Id);
            var subUsool = await GetOrCreateCategoryAsync("شرح الأصول الثلاثة والتوحيد", CategoryType.Lesson, catAqeedah.Id);
            var subAkhira = await GetOrCreateCategoryAsync("الإيمان باليوم الآخر وعلامات الساعة", CategoryType.Lesson, catAqeedah.Id);
            var subSalah = await GetOrCreateCategoryAsync("فقه الصلاة والخشوع", CategoryType.Lesson, catFiqh.Id);
            var subSiyam = await GetOrCreateCategoryAsync("أحكام الصيام والزكاة", CategoryType.Lesson, catFiqh.Id);
            var subShamail = await GetOrCreateCategoryAsync("شمائل الحبيب المصطفى ﷺ", CategoryType.Lesson, catSeerah.Id);
            var subSahaba = await GetOrCreateCategoryAsync("سير الصحابة والصالحين", CategoryType.Lesson, catSeerah.Id);

            // Book categories
            var catBooksMain = await GetOrCreateCategoryAsync("مؤلفات فضيلة الشيخ أبو ذر", CategoryType.Book);
            var catBooksGeneral = await GetOrCreateCategoryAsync("رسائل ومطويات دعوية", CategoryType.Book);
            await GetOrCreateCategoryAsync("فتاوى واستشارات دعوية", CategoryType.Book); // Empty category for dashboard

            var subBooksRaqaeq = await GetOrCreateCategoryAsync("كتب التزكية والرقائق", CategoryType.Book, catBooksMain.Id);
            var subBooksSolook = await GetOrCreateCategoryAsync("كتب السلوك والهمة العالية", CategoryType.Book, catBooksMain.Id);
            var subBooksFiqh = await GetOrCreateCategoryAsync("كتب الفقه والآداب الشرعية", CategoryType.Book, catBooksMain.Id);

            // Sermon categories
            var catSermonsMain = await GetOrCreateCategoryAsync("خطب الجمعة المنبرية", CategoryType.Sermon);
            var catSermonsSeasons = await GetOrCreateCategoryAsync("خطب الأعياد والمواسم الفاضلة", CategoryType.Sermon);

            var subSermonsMawt = await GetOrCreateCategoryAsync("خطب الموت والدار الآخرة", CategoryType.Sermon, catSermonsMain.Id);
            var subSermonsTawba = await GetOrCreateCategoryAsync("خطب التوبة والرجوع إلى الله", CategoryType.Sermon, catSermonsMain.Id);
            var subSermonsAkhlaq = await GetOrCreateCategoryAsync("خطب الأخلاق والسلوك المجتمعي", CategoryType.Sermon, catSermonsMain.Id);
            var subSermonsRamadan = await GetOrCreateCategoryAsync("خطب شهر رمضان وعيد الفطر", CategoryType.Sermon, catSermonsSeasons.Id);
            var subSermonsDhulHijjah = await GetOrCreateCategoryAsync("خطب عشر ذي الحجة وعيد الأضحى", CategoryType.Sermon, catSermonsSeasons.Id);

            // Quran categories
            var catQuranMain = await GetOrCreateCategoryAsync("مجالس تدبر القرآن العظيم", CategoryType.Quran);
            var subQuranAmma = await GetOrCreateCategoryAsync("تفسير وتدبر جزء عم", CategoryType.Quran, catQuranMain.Id);
            var subQuranKahf = await GetOrCreateCategoryAsync("أسرار وتدبر سورة الكهف", CategoryType.Quran, catQuranMain.Id);

            // =========================================================================
            // 4. Books (الكتب والمؤلفات)
            // =========================================================================
            var books = new List<Book>
            {
                new()
                {
                    Title = "ففروا إلى الله",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "الكتاب الأشهر لفضيلة الشيخ في الدعوة إلى التوبة الصادقة والإنابة، وبيان خطوات الفرار من المعاصي والشهوات والفتن إلى رحاب طاعة الله ومحبته ورضوانه.",
                    PdfFilePath = "/uploads/books/fafirru-ila-allah.pdf",
                    CoverImagePath = "/uploads/books/covers/fafirru-ila-allah.jpg",
                    PublishDate = thisMonthStart.AddDays(2),
                    CategoryId = subBooksRaqaeq.Id
                },
                new()
                {
                    Title = "البداية لمن يروم الهداية",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "دليل منهجي مبسط وشامل لكل تائب ومقبل على الله، يرسم معالم الطريق في العبادة وطلب العلم ومجاهدة النفس.",
                    PdfFilePath = "/uploads/books/al-bidaya.pdf",
                    CoverImagePath = "/uploads/books/covers/al-bidaya.jpg",
                    PublishDate = thisMonthStart.AddDays(5),
                    CategoryId = subBooksSolook.Id
                },
                new()
                {
                    Title = "إلى أصحاب الهمم العالية",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "نداء حار لإيقاظ الهمم الغافلة نحو معالي الأمور والاجتهاد في العبادة وترك الكسل والتسويف في عمارة الأوقات بالصالحات.",
                    PdfFilePath = "/uploads/books/ashab-al-himam.pdf",
                    CoverImagePath = "/uploads/books/covers/ashab-al-himam.jpg",
                    PublishDate = lastMonth.AddDays(10),
                    CategoryId = subBooksSolook.Id
                },
                new()
                {
                    Title = "عالج حزنك بالقرآن والذكر",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "بلسم شافٍ للقلوب الكليمة والنفوس المهمومة، يستعرض هدي الوحيين في معالجة القلق والهموم والأحزان باليقين والرضا بحكمة الله.",
                    PdfFilePath = "/uploads/books/3aleg-hoznak.pdf",
                    CoverImagePath = "/uploads/books/covers/3aleg-hoznak.jpg",
                    PublishDate = lastMonth.AddDays(15),
                    CategoryId = subBooksRaqaeq.Id
                },
                new()
                {
                    Title = "أصلح قلبك وتدارك عمرك",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "رسالة جامعة في تفقّد علامات حياة القلب وموتها، وطرق تطهيره من الكبر والحسد والغل والرياء والعجب بالعمل.",
                    PdfFilePath = "/uploads/books/aslih-qalbak.pdf",
                    CoverImagePath = "/uploads/books/covers/aslih-qalbak.jpg",
                    PublishDate = thisMonthStart.AddDays(8),
                    CategoryId = subBooksRaqaeq.Id
                },
                new()
                {
                    Title = "رسالة إلى حيران في طريق الإيمان",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "إرشادات لطيفة تخاطب الحائرين والشاردين برفق، وتبدد ظلمات الشبهات والشهوات بأنوار الهداية النبوية والاستقامة.",
                    PdfFilePath = "/uploads/books/resala-ila-hayran.pdf",
                    CoverImagePath = "/uploads/books/covers/resala-ila-hayran.jpg",
                    PublishDate = lastMonth.AddDays(5),
                    CategoryId = catBooksGeneral.Id
                },
                new()
                {
                    Title = "زاد السائرين إلى رب العالمين",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "وقفات إيمانية ومحطات تربوية في التوكل والصبر والشكر ومحاسبة النفس يوماً بيوم لتستمر شعلة الإيمان متقدة.",
                    PdfFilePath = "/uploads/books/zad-al-saereen.pdf",
                    CoverImagePath = "/uploads/books/covers/zad-al-saereen.jpg",
                    PublishDate = lastMonth.AddDays(20),
                    CategoryId = subBooksSolook.Id
                },
                new()
                {
                    Title = "فقه الخشوع في الصلاة",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "خطوات عملية وأسرار روحية لكيفية تذوق حلاوة مناجاة الله في الركوع والسجود وطرد الخواطر والوساوس الشيطانية.",
                    PdfFilePath = "/uploads/books/feqh-al-khoshoo.pdf",
                    CoverImagePath = "/uploads/books/covers/feqh-al-khoshoo.jpg",
                    PublishDate = thisMonthStart.AddDays(12),
                    CategoryId = subBooksFiqh.Id
                },
                new()
                {
                    Title = "الميزان في معيار السلوك والإيمان",
                    AuthorName = "فضيلة الشيخ أبو ذر القلموني",
                    Description = "كتاب تربوي منهجي جديد سيصدر قريباً بإذن الله تعالى يتناول توازن الشخصية المسلمة بين العبادة والدعوة والعمل المجتمعي.",
                    PdfFilePath = null,
                    CoverImagePath = "/uploads/books/covers/al-mizan.jpg",
                    PublishDate = nextMonth.AddDays(15), // Scheduled (Future)
                    CategoryId = subBooksSolook.Id
                }
            };

            foreach (var book in books)
            {
                if (!await context.Books.AnyAsync(b => b.Title == book.Title))
                {
                    await context.Books.AddAsync(book);
                    addedBooks++;
                }
            }
            await context.SaveChangesAsync();

            // =========================================================================
            // 5. Lessons (الدروس والمحاضرات العلمية)
            // =========================================================================
            var lessons = new List<Lesson>
            {
                new()
                {
                    Title = "الدرس 01: حقيقة الفرار إلى الله وتجريد الإخلاص",
                    Description = "مقدمة تأصيلية في معنى الفرار إلى الله سبحانه، وتجريد النية والإخلاص لله وحده في الأقوال والأعمال.",
                    VideoFilePath = "/uploads/lessons/videos/fafirru-lesson-01.mp4",
                    AudioFilePath = "/uploads/lessons/audio/fafirru-lesson-01.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/fafirru-01.jpg",
                    DurationInMinutes = 48,
                    PublishDate = thisMonthStart.AddDays(1),
                    CategoryId = subFafirru.Id
                },
                new()
                {
                    Title = "الدرس 02: شروط التوبة النصوح وكيفية الثبات عليها",
                    Description = "بيان أركان التوبة النصوح، وكيف يتغلب التائب على حنينه للمعصية ومجاهدة قرناء السوء ووساوس الشيطان.",
                    VideoFilePath = "/uploads/lessons/videos/fafirru-lesson-02.mp4",
                    AudioFilePath = "/uploads/lessons/audio/fafirru-lesson-02.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/fafirru-02.jpg",
                    DurationInMinutes = 55,
                    PublishDate = thisMonthStart.AddDays(3),
                    CategoryId = subFafirru.Id
                },
                new()
                {
                    Title = "الدرس 03: خطورة الرياء وحب الشهرة والظهور",
                    Description = "تسليط الضوء على الشرك الخفي ومداخل الشيطان لإحباط أعمال الصالحين وإفساد طاعاتهم.",
                    VideoFilePath = null,
                    AudioFilePath = "/uploads/lessons/audio/amradh-lesson-03.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/amradh-03.jpg",
                    DurationInMinutes = 38,
                    PublishDate = lastMonth.AddDays(12),
                    CategoryId = subAmradh.Id
                },
                new()
                {
                    Title = "الدرس 04: دواء قسوة القلوب وذكر هادم اللذات",
                    Description = "كيف تلين القلوب القاسية؟ وما أثر زيارة القبور وعيادة المرضى وتدبر آيات الوعيد في إحياء القلب الميت.",
                    VideoFilePath = "/uploads/lessons/videos/amradh-lesson-04.mp4",
                    AudioFilePath = "/uploads/lessons/audio/amradh-lesson-04.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/amradh-04.jpg",
                    DurationInMinutes = 62,
                    PublishDate = thisMonthStart.AddDays(7),
                    CategoryId = subAmradh.Id
                },
                new()
                {
                    Title = "الدرس 05: حسن الظن بالله في أوقات الشدائد والابتلاء",
                    Description = "دروس في الرضا بالقضاء والقدر، واستبشار المؤمن بلطف الله الخفي وراء حجب البلاء والمحن.",
                    VideoFilePath = null,
                    AudioFilePath = "/uploads/lessons/audio/maqamat-lesson-05.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/maqamat-05.jpg",
                    DurationInMinutes = 42,
                    PublishDate = lastMonth.AddDays(18),
                    CategoryId = subMaqamat.Id
                },
                new()
                {
                    Title = "الدرس 06: فضل قيام الليل وحلاوة المناجاة في السحر",
                    Description = "شرف المؤمن قيامه بالليل، وتوجيهات عملية لإيقاظ النفس والاستمتاع بالركعات الخاشعة في جوف الليل الآخر.",
                    VideoFilePath = null,
                    AudioFilePath = "/uploads/lessons/audio/salah-lesson-06.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/salah-06.jpg",
                    DurationInMinutes = 50,
                    PublishDate = lastMonth.AddDays(22),
                    CategoryId = subSalah.Id
                },
                new()
                {
                    Title = "الدرس 07: مفاتيح تدبر القرآن وأثره في إصلاح السلوك",
                    Description = "قواعد ذهبية لفتح مغاليق القلوب لآيات التنزيل، وتجاوز مجرد سرد الحروف إلى معايشة الروح والمعنى.",
                    VideoFilePath = "/uploads/lessons/videos/quran-lesson-07.mp4",
                    AudioFilePath = "/uploads/lessons/audio/quran-lesson-07.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/quran-07.jpg",
                    DurationInMinutes = 45,
                    PublishDate = thisMonthStart.AddDays(10),
                    CategoryId = subFafirru.Id
                },
                new()
                {
                    Title = "الدرس 08: علامات محبة الله للعبد وثمار القرب",
                    Description = "حديث شريف: (فإذا أحببته كنت سمعه الذي يسمع به وبصره الذي يبصر به)، شرح مفصل ووقفات إيمانية.",
                    VideoFilePath = null,
                    AudioFilePath = "/uploads/lessons/audio/maqamat-lesson-08.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/maqamat-08.jpg",
                    DurationInMinutes = 39,
                    PublishDate = lastMonth.AddDays(25),
                    CategoryId = subMaqamat.Id
                },
                new()
                {
                    Title = "الدرس 09: المحاسبة اليومية قبل فوات الأوان",
                    Description = "موقف عمر بن الخطاب رضي الله عنه: (حاسبوا أنفسكم قبل أن تحاسبوا)، خطوات تطبيقية للمحاسبة قبل المنام.",
                    VideoFilePath = "/uploads/lessons/videos/fafirru-lesson-09.mp4",
                    AudioFilePath = "/uploads/lessons/audio/fafirru-lesson-09.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/fafirru-09.jpg",
                    DurationInMinutes = 53,
                    PublishDate = thisMonthStart.AddDays(14),
                    CategoryId = subFafirru.Id
                },
                new()
                {
                    Title = "الدرس 10: آفات اللسان وثمار الصمت وحفظ الجوارح",
                    Description = "وهل يكب الناس في النار على وجوههم إلا حصائد ألسنتهم؟ خطورة الغيبة والنميمة وفضول الكلام.",
                    VideoFilePath = null,
                    AudioFilePath = "/uploads/lessons/audio/amradh-lesson-10.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/amradh-10.jpg",
                    DurationInMinutes = 31,
                    PublishDate = lastMonth.AddDays(28),
                    CategoryId = subAmradh.Id
                },
                new()
                {
                    Title = "الدرس 11: وقفات مع حديث: احفظ الله يحفظك",
                    Description = "الوصية النبوية الخالدة لابن عباس رضي الله عنهما، وقواعد التوكل والاستعانة بالله ومصاحبة الرخاء والشدة.",
                    VideoFilePath = "/uploads/lessons/videos/usool-lesson-11.mp4",
                    AudioFilePath = "/uploads/lessons/audio/usool-lesson-11.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/usool-11.jpg",
                    DurationInMinutes = 58,
                    PublishDate = thisMonthStart.AddDays(4),
                    CategoryId = subUsool.Id
                },
                new()
                {
                    Title = "الدرس 12: الاستعداد لمواسم الطاعات والنفحات الربانية",
                    Description = "درس تربوي مرتقب عن كيفية استقبال شهر رمضان ومواسم الفضل بروح جديدة وهمة عالية.",
                    VideoFilePath = "/uploads/lessons/videos/siyam-lesson-12.mp4",
                    AudioFilePath = "/uploads/lessons/audio/siyam-lesson-12.mp3",
                    ThumbnailPath = "/uploads/lessons/thumbs/siyam-12.jpg",
                    DurationInMinutes = 60,
                    PublishDate = nextMonth.AddDays(5), // Scheduled (Future)
                    CategoryId = subSiyam.Id
                }
            };

            foreach (var lesson in lessons)
            {
                if (!await context.Lessons.AnyAsync(l => l.Title == lesson.Title))
                {
                    await context.Lessons.AddAsync(lesson);
                    addedLessons++;
                }
            }
            await context.SaveChangesAsync();

            // =========================================================================
            // 6. Sermons (الخطب والمنبريات)
            // =========================================================================
            var sermons = new List<Sermon>
            {
                new()
                {
                    Title = "خطبة الجمعة: ففروا إلى الله إن كنتم مؤمنين",
                    Description = "خطبة جمعة جامعة ومزلزلة في الحث على التوبة العاجلة والإقبال على الله في أزمنة الفتن والغفلة.",
                    KhutbahDate = thisMonthStart.AddDays(3),
                    PublishDate = thisMonthStart.AddDays(3),
                    VideoFilePath = "/uploads/sermons/videos/khutbah-fafirru.mp4",
                    AudioFilePath = "/uploads/sermons/audio/khutbah-fafirru.mp3",
                    CategoryId = subSermonsTawba.Id
                },
                new()
                {
                    Title = "خطبة الجمعة: الاستعداد للرحيل وسؤال القبر",
                    Description = "تذكرة بظلمة اللحود وهادم اللذات وضرورة الاستكثار من الزاد ليوم المعاد وسؤال الملكين منكر ونكير.",
                    KhutbahDate = thisMonthStart.AddDays(10),
                    PublishDate = thisMonthStart.AddDays(10),
                    VideoFilePath = "/uploads/sermons/videos/khutbah-mawt.mp4",
                    AudioFilePath = "/uploads/sermons/audio/khutbah-mawt.mp3",
                    CategoryId = subSermonsMawt.Id
                },
                new()
                {
                    Title = "خطبة الجمعة: ألا بذكر الله تطمئن القلوب",
                    Description = "بيان أثر الذكر والاستغفار في طمأنينة النفوس وزوال الهموم والأكدار وانشراح الصدور.",
                    KhutbahDate = lastMonth.AddDays(7),
                    PublishDate = lastMonth.AddDays(7),
                    VideoFilePath = null,
                    AudioFilePath = "/uploads/sermons/audio/khutbah-zikr.mp3",
                    CategoryId = subSermonsAkhlaq.Id
                },
                new()
                {
                    Title = "خطبة الجمعة: بر الوالدين وحرمة العقوق",
                    Description = "عظمة حق الوالدين في شريعة الإسلام وجزاؤهما عند الله تعالى، والتحذير الأكيد من عقوقهما ولو بأف.",
                    KhutbahDate = lastMonth.AddDays(14),
                    PublishDate = lastMonth.AddDays(14),
                    VideoFilePath = "/uploads/sermons/videos/khutbah-walidayn.mp4",
                    AudioFilePath = "/uploads/sermons/audio/khutbah-walidayn.mp3",
                    CategoryId = subSermonsAkhlaq.Id
                },
                new()
                {
                    Title = "خطبة الجمعة: حلاوة الصلاة وخشوع الجوارح",
                    Description = "الصلاة معراج المؤمن وقرة عين النبي ﷺ، كيف نؤديها خاشعين لتنهانا عن الفحشاء والمنكر.",
                    KhutbahDate = lastMonth.AddDays(21),
                    PublishDate = lastMonth.AddDays(21),
                    VideoFilePath = null,
                    AudioFilePath = "/uploads/sermons/audio/khutbah-salah.mp3",
                    CategoryId = subSermonsAkhlaq.Id
                },
                new()
                {
                    Title = "خطبة عيد الفطر: فرح الطائعين وجائزة الصائمين",
                    Description = "خطبة عيد الفطر المبارك تبين معنى الفرح الشرعي بنعمة إتمام الصيام وشكر الله وصلة الأرحام.",
                    KhutbahDate = lastMonth.AddDays(28),
                    PublishDate = lastMonth.AddDays(28),
                    VideoFilePath = "/uploads/sermons/videos/khutbah-eid-fitr.mp4",
                    AudioFilePath = "/uploads/sermons/audio/khutbah-eid-fitr.mp3",
                    CategoryId = subSermonsRamadan.Id
                },
                new()
                {
                    Title = "خطبة عيد الأضحى: التضحية والفداء ومحبة الخليلين",
                    Description = "دروس بالغة من قصة خليل الرحمن إبراهيم وولده إسماعيل عليهما السلام في تمام الاستسلام والانقياد لأمر الله.",
                    KhutbahDate = lastMonth.AddDays(2),
                    PublishDate = lastMonth.AddDays(2),
                    VideoFilePath = "/uploads/sermons/videos/khutbah-eid-adha.mp4",
                    AudioFilePath = "/uploads/sermons/audio/khutbah-eid-adha.mp3",
                    CategoryId = subSermonsDhulHijjah.Id
                },
                new()
                {
                    Title = "خطبة الجمعة القادمة: فضائل الصبر ومقامات الصابرين",
                    Description = "خطبة منبرية مرتقبة عن الصبر على أقدار الله المؤلمة، والصبر عن المعاصي، والصبر على مشاق الطاعة.",
                    KhutbahDate = nextMonth.AddDays(3),
                    PublishDate = nextMonth.AddDays(3), // Scheduled (Future)
                    VideoFilePath = "/uploads/sermons/videos/khutbah-sabr.mp4",
                    AudioFilePath = "/uploads/sermons/audio/khutbah-sabr.mp3",
                    CategoryId = subSermonsAkhlaq.Id
                }
            };

            foreach (var sermon in sermons)
            {
                if (!await context.Sermons.AnyAsync(s => s.Title == sermon.Title))
                {
                    await context.Sermons.AddAsync(sermon);
                    addedSermons++;
                }
            }
            await context.SaveChangesAsync();

            // =========================================================================
            // 7. Articles (المقالات الإسلامية بتنسيق HTML ثري للريتش تكست إيديتور)
            // =========================================================================
            var articles = new List<Article>
            {
                new()
                {
                    Title = "كيف تبدأ طريق التوبة الصادقة والرجوع إلى الله؟",
                    Description = "خطوات عملية ووصايا إيمانية لكل من عزم على التوبة وبدء صفحة بيضاء مع الله الرحيم الودود.",
                    Body = @"<h2>مقدمة في حقيقة التوبة</h2>
<p>التوبة ليست مجرد كلمات تُردّد باللسان مع بقاء القلب معلقاً بالشهوة، بل هي <strong>انقلاب كلي في مسار الحياة</strong>، وتحول صادق من مساخط الله إلى مراضيه ومحبته.</p>

<h3>شروط التوبة النصوح:</h3>
<ul>
  <li><strong>الإقلاع الفوري:</strong> ترك الذنب في الحال دون تسويف أو تأجيل، فالموت يأتي بغتة.</li>
  <li><strong>الندم العميق:</strong> أن يعتصر القلب ألماً وخجلاً وحياءً من نظر الله إليه حين عصاه بنعمه.</li>
  <li><strong>العزم الصادق:</strong> عقد النية المؤكدة والمخلصة على عدم العودة للذنب أبداً ما امتد به العمر.</li>
  <li><strong>رد المظالم:</strong> إن كان الذنب متعلقاً بحقوق العباد كالأموال والأعراض، فلابد من استحلالهم.</li>
</ul>

<blockquote>
  قال الله تبارك وتعالى: <em>﴿وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ﴾</em> [النور: 31]
</blockquote>

<p>فبادر يا أخي المبارك وافتح صفحة جديدة مع ربك الرحيم الذي يبسط يده بالليل ليتوب مسيء النهار، ويبسط يده بالنهار ليتوب مسيء الليل حتى تطلع الشمس من مغربها.</p>",
                    PublishDate = thisMonthStart.AddDays(2)
                },
                new()
                {
                    Title = "علاج الهم والضيق بالقرآن الكريم والأذكار النبوية",
                    Description = "بلسم رباني ونبوي لكل مهموم ومحزون يبدد ظلمات الضيق بأنوار اليقين والتوكل على الله.",
                    Body = @"<h2>القرآن شفاء ورحمة لما في الصدور</h2>
<p>ما نزل بعبد مؤمن همّ ولا غمّ ولا ضيق في صدره إلا وجعل الله في كتابه الحكيم وسنة نبيه المصطفى ﷺ مخرجاً وشفاءً ونوراً وسكينة تُطفئ لهيب الأحزان.</p>

<h3>أدوية نبوية مجربة لدفع الكرب والهم:</h3>
<ol>
  <li><strong>دعاء ذي النون:</strong> <em>«لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ»</em> - قال ﷺ: لم يدعُ بها رجل مسلم في شيء قط إلا استجاب الله له.</li>
  <li><strong>دعاء الكرب العظيم:</strong> <em>«لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ»</em>.</li>
  <li><strong>كثرة الاستغفار:</strong> «من لزم الاستغفار جعل الله له من كل ضيق مخرجاً ومن كل هم فرجاً ورزقه من حيث لا يحتسب».</li>
  <li><strong>الصلاة على النبي ﷺ:</strong> حين قال أبي بن كعب: أجعل لك صلاتي كلها؟ قال: «إذن تُكفى همّك ويُغفر ذنبك».</li>
</ol>

<p>فاطمئن ولا تحزن وتوكل على الحي الذي لا يموت، واعلم أن ما أصابك لم يكن ليخطئك، وما أخطأك لم يكن ليصيبك.</p>",
                    PublishDate = thisMonthStart.AddDays(6)
                },
                new()
                {
                    Title = "خطوات عملية للخشوع في الصلاة ودفع الوساوس",
                    Description = "أسرار روحية وأسباب ظاهرة وباطنة تعين المسلم على تذوق حلاوة مناجاة الله والراحة بالصلاة.",
                    Body = @"<h2>الصلاة.. قرة عين العارفين وملاذ الخائفين</h2>
<p>كان الحبيب المصطفى ﷺ إذا حزبه أمر فزع إلى الصلاة، وكان ينادي بلالاً فيقول: <strong>«أرحنا بها يا بلال»</strong>. فكيف نستعيد خشوع صلاتنا؟</p>

<h3>أسباب استجلاب الخشوع في الصلاة:</h3>
<ul>
  <li><strong>إسباغ الوضوء:</strong> استشعار تساقط الذنوب مع قطرات الماء مع ترديد الدعاء المأثور عقبه.</li>
  <li><strong>التبكير والانتظار:</strong> الجلوس في المسجد قبل الأذان يقطع شواغل الدنيا ويهيئ القلب للوقوف بين يدي الملك الجليل.</li>
  <li><strong>تدبر الفاتحة:</strong> تذكّر أن الله العظيم يجيبك عند كل آية تقرؤها: (حمدني عبدي.. أثنى علي عبدي.. مجدني عبدي).</li>
  <li><strong>الطمأنينة التامة:</strong> سكون الأعضاء في الركوع والسجود وعدم العجلة ونقر الصلاة.</li>
</ul>

<blockquote>
  ﴿قَدْ أَفْلَحَ الْمُؤْمِنُونَ * الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ﴾
</blockquote>",
                    PublishDate = lastMonth.AddDays(14)
                },
                new()
                {
                    Title = "أثر لقيمات الحلال في رقة القلب واستجابة الدعاء",
                    Description = "بيان خطورة المال المشبوه والحرام على إفساد البصيرة وقسوة القلب ومنع استجابة الدعوات.",
                    Body = @"<h2>أطب مطعمك تكن مستجاب الدعوة</h2>
<p>إن من أعظم أسباب رقة القلب واستنارة البصيرة هو طيب المكسب وطهارة المطعم والملبس من كل شائبة حرام أو شبهة ربا أو غش.</p>

<p>ذكر النبي ﷺ: <em>«الرجل يطيل السفر أشعث أغبر، يمد يديه إلى السماء: يا رب، يا رب، ومطعمه حرام، ومشربه حرام، وملبسه حرام، وغذي بالحرام، فأنّى يُستجاب لذلك؟!»</em>.</p>

<h3>ثمار تحري الحلال:</h3>
<ul>
  <li>بركة العمر والرزق وصلاح الزوجة والذرية.</li>
  <li>سرعة انسكاب العبرة وخشوع القلب لسماع القرآن.</li>
  <li>استجابة الدعاء عند النوازل والشدائد.</li>
</ul>",
                    PublishDate = lastMonth.AddDays(20)
                },
                new()
                {
                    Title = "فضل مجالس الذكر وبركة صحبة الصالحين",
                    Description = "عظمة الجليس الصالح كحامل المسك ونزول الملائكة وغشيان الرحمة لمجالس العلم والإيمان.",
                    Body = @"<h2>هم القوم لا يشقى بهم جليسهم</h2>
<p>ما اجتمع قوم في بيت من بيوت الله يتلون كتاب الله ويتدارسونه بينهم إلا نزلت عليهم السكينة، وغشيتهم الرحمة، وحفتهم الملائكة، وذكرهم الله فيمن عنده.</p>

<p>إن مصاحبة الأخيار تذكرك بربك إذا نسيت، وتعينك إذا ذكرت، وتدلك على سبل النجاة في الفتن.</p>",
                    PublishDate = thisMonthStart.AddDays(11)
                },
                new()
                {
                    Title = "أسرار سورة الكهف ومنهج النجاة من الفتن الأربع",
                    Description = "دراسة تدبرية في قصص سورة الكهف ومحاور النجاة من فتنة الدين، والمال، والعلم، والسلطان.",
                    Body = @"<h2>السفينة، والغلام، والجدار.. حكم خفية</h2>
<p>سورة الكهف نور ما بين الجمعتين، وهي حصن حصين من فتنة الدجال الأعظم لما حوته من معالم النجاة من أعظم فتن الحياة الدنيا.</p>

<h3>الفتن الأربع في سورة الكهف:</h3>
<ol>
  <li><strong>فتنة الدين:</strong> في قصة أصحاب الكهف (والعلاج: الصحبة الصالحة والاستمساك بالحق).</li>
  <li><strong>فتنة المال:</strong> في قصة صاحب الجنتين (والعلاج: معرفة زوال الدنيا وقول ما شاء الله لا قوة إلا بالله).</li>
  <li><strong>فتنة العلم:</strong> في قصة موسى والخضر (والعلاج: التواضع وعدم العجب بما أوتيت).</li>
  <li><strong>فتنة السلطة والقوة:</strong> في قصة ذي القرنين (والعلاج: العدل وتوظيف النعم في نفع الخلق).</li>
</ol>",
                    PublishDate = nextMonth.AddDays(10) // Scheduled (Future)
                }
            };

            foreach (var article in articles)
            {
                if (!await context.Articles.AnyAsync(a => a.Title == article.Title))
                {
                    await context.Articles.AddAsync(article);
                    addedArticles++;
                }
            }
            await context.SaveChangesAsync();

            // =========================================================================
            // 8. SiteAlerts (تنبيهات الموقع)
            // =========================================================================
            try
            {
                var alerts = new List<SiteAlert>
                {
                    new()
                    {
                        Title = "بث مباشر لدرس فضيلة الشيخ الأسبوعي",
                        Content = "تابعوا معنا الدرس الأسبوعي لفضيلة الشيخ أبو ذر القلموني كل يوم خميس بعد صلاة المغرب مباشرة عبر منصاتنا الرسمية.",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new()
                    {
                        Title = "صدور الطبعة الجديدة من كتاب «ففروا إلى الله»",
                        Content = "يسر إدارة الموقع الإعلان عن توفر الطبعة الجديدة المنقحة من كتاب «ففروا إلى الله» بصيغة PDF عالية الجودة مجاناً لجميع زوار المنصة.",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    },
                    new()
                    {
                        Title = "جدول المحاضرات والدروس العلمية لشهر رمضان المبارك",
                        Content = "تم نشر جدول السلاسل الدعوية والإيمانية والمجالس القرآنية الخاصة بشهر رمضان المبارك في قسم الدروس والمحاضرات.",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        Title = "دعاء بظهر الغيب لفضيلة الشيخ",
                        Content = "نسأل الله تبارك وتعالى أن يحفظ فضيلة الشيخ أبو ذر القلموني، ويبارك في علمه وعمره وصحته وينفع به الإسلام والمسلمين.",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        Title = "أعمال صيانة دورية على خوادم البث الصوتي",
                        Content = "تنبيه سابق: تم الانتهاء بحمد الله من أعمال التحديث الدوري لخوادم البث المباشر وتسريع تشغيل المقاطع الصوتية.",
                        IsActive = false, // Inactive for dashboard testing
                        CreatedAt = DateTime.UtcNow.AddDays(-15)
                    }
                };

                foreach (var alert in alerts)
                {
                    if (!await context.SiteAlerts.AnyAsync(a => a.Title == alert.Title))
                    {
                        await context.SiteAlerts.AddAsync(alert);
                        addedAlerts++;
                    }
                }
                await context.SaveChangesAsync();
            }
            catch
            {
                // SiteAlerts table might not have migration executed yet
            }

            int totalAdded = addedUsers + addedCategories + addedBooks + addedLessons + addedSermons + addedArticles + addedAlerts;
            if (totalAdded == 0)
            {
                return "جميع البيانات الإسلامية (الكتب، الدروس، الخطب، المقالات، التصنيفات) موجودة بالفعل في قاعدة البيانات.";
            }

            return $"تمت إضافة البيانات بنجاح: {addedCategories} تصنيف، {addedBooks} كتاب، {addedLessons} درس، {addedSermons} خطبة، {addedArticles} مقال، {addedAlerts} تنبيه، {addedUsers} مستخدم.";
        }
    }
}
