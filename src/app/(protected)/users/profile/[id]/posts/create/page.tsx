import { CreatePostForm } from "@/features/posts/ui/CreatePostForm";
import styles from "./CreatePostPage.module.scss";
import { CreatePostWidget } from '@/widgets/CreatePostWidget/CreatePostWidget'

export default function CreatePostPage() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Создать пост</h1>
      <CreatePostWidget />
    </div>
  );
}