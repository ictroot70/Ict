import { CreatePostForm } from "@/features/posts/ui/CreatePostForm";

export const CreatePostWidget = () => {
  return (
    <div className="p-4 border rounded max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Создать пост</h2>
      <CreatePostForm />
    </div>
  );
};