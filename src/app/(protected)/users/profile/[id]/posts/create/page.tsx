import { CreatePostForm } from "@/features/posts/ui/CreatePostForm";
import styles from "./CreatePostPage.module.scss";

export default function CreatePostPage() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Создать пост</h1>
      <CreatePostForm />
    </div>
  );
}