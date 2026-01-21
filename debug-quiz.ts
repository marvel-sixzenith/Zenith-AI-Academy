
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'cmkmrg7p000005w4jbd2lmiia'; // Extracted from user's screenshot URL

    console.log(`Fetching data for user: ${userId}`);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            quizSubmissions: {
                orderBy: { completedAt: 'desc' },
                take: 3,
                include: {
                    answers: true,
                    lesson: {
                        select: {
                            title: true,
                            contentData: true
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`Found user: ${user.name}`);
    console.log(`Quiz Submissions count: ${user.quizSubmissions.length}`);

    user.quizSubmissions.forEach((sub, idx) => {
        console.log(`\n--- Submission ${idx + 1} ---`);
        console.log(`ID: ${sub.id}`);
        console.log(`Lesson: ${sub.lesson.title}`);
        console.log(`Score: ${sub.score}/${sub.totalQuestions}`);
        console.log(`CompletedAt: ${sub.completedAt}`);
        console.log(`Answers Count: ${sub.answers.length}`);

        if (sub.answers.length > 0) {
            console.log('Answers Sample:');
            sub.answers.forEach(a => {
                console.log(` - QID: ${a.questionId} | Text: "${a.questionText}" | Selected: "${a.selectedOption}" | Correct: ${a.isCorrect}`);
            });
        } else {
            console.log('WARN: No answers found for this submission.');
        }

        // Check content data for ID matching
        try {
            if (sub.lesson.contentData) {
                const data = JSON.parse(sub.lesson.contentData);
                if (data.questions) {
                    console.log('Questions in Lesson Content:');
                    data.questions.forEach((q: any) => {
                        console.log(` - Content QID: ${q.id} | Text: "${q.question}"`);
                    });
                }
            }
        } catch (e) {
            console.log('Error parsing contentData');
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
