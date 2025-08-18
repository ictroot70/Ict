import { CreatePostForm } from "@/features/posts/ui/CreatePostForm";
import styles from "./CreatePostWidget.module.scss";

export const CreatePostWidget = () => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Описание</h2>
      <CreatePostForm />
    </div>
  );
};