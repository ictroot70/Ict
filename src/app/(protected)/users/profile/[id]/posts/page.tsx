"use client"

import styles from "./PostsPage.module.scss";
import Link from "next/link";
import { useParams } from 'next/navigation'

export default function PostsPage() {

  const { id } = useParams<{ id: string }>();
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Посты</h1>

      {/* Ссылка на создание поста */}
      <Link href={`/users/profile/${id}/posts/create`} className={styles.createLink}>
        ➕ Создать пост
      </Link>

      {/* Заглушка списка */}
      <div className={styles.postsList}>
        <p>Здесь будет список постов (mock)</p>
      </div>
    </div>
  );
}
