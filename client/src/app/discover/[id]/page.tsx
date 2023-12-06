import Image from 'next/image';
import { notFound } from 'next/navigation';

import styles from './styles/post.module.scss';

import 'dotenv/config';
const baseURL = process.env.API_URL
  ? process.env.API_URL
  : 'https://api.maphub.pro';

async function fetchData(id: string) {
  try {
    const post = await fetch(`${baseURL}/posts/post/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!post.ok) {
      return undefined;
    }

    const body: { success: boolean; post: any } = await post.json();
    return body.post;
  } catch (error) {
    return undefined;
  }
}

async function Post({ params }: { params: { id: string } }) {
  const post = await fetchData(params.id);

  if (!post) {
    notFound();
  }

  return (
    <main className={styles['post__main']}>
      <div className={styles['post__container']}>
        <Image
          className={styles['post__image']}
          src={`data:image/svg+xml;utf8,${encodeURIComponent(post.svg)}`}
          alt={`A Map titled ${post.title} with a description of ${post.description}`}
          height={1000}
          width={1000}
        />
      </div>
      <div className={styles['post__comments']}></div>
    </main>
  );
}

export default Post;
