'use client';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import CommentsHead from './components/commentsHead';
import CommentsDivider from './components/commentsDivider';
import CommentsCoordinator from './components/commentsCoordinator';
import PostAPI from 'api/PostAPI';
import styles from './styles/post.module.scss';

interface PostType {
  title: string;
  description: string;
  owner: {
    username: string;
    profilePic: string;
  };
  svg: string;
}
const Post = ({ params }: { params: { id: string } }) => {
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const post = await PostAPI.getPostById(params.id);

        console.log('FETCHING POST NOW', post);
        const body: { success: boolean; post: any } = post.data;

        if (!body.success) {
          console.log('NOT SUCCESSFUL RETRIVEVELA OF POST ID');
          return undefined;
        }

        setPost(body.post);
      } catch (error) {
        console.error('Error fetching post:', error);
        setPost(null); // or handle the error as needed
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!post) {
    console.log('CANNOT FIND THE POST');
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
      <div className={styles['post__comments']}>
        <CommentsHead
          user={{
            username: post.owner.username,
            profilePic: post.owner.profilePic,
          }}
          title={post.title}
          description={post.description}
        />
        <CommentsDivider />
        <CommentsCoordinator post={post} />
      </div>
    </main>
  );
};

export default Post;
