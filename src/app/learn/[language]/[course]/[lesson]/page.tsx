import { courses } from '@/lib/signs/languages';
import LessonClient from './LessonClient';

export function generateStaticParams() {
  return courses.flatMap(course =>
    course.lessons.map(lesson => ({
      language: course.language,
      course: course.id,
      lesson: lesson.id,
    }))
  );
}

export default function LessonPage() {
  return <LessonClient />;
}
