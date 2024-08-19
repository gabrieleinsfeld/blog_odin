const prisma = require("./prisma");
const bcryptjs = require("bcryptjs");

// USER FUNCTIONS
async function updateUser(id, firstName, lastName, username) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        username,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function updateUserPassword(id, password) {
  try {
    const hashedPassword = bcryptjs.hash(
      password,
      10,
      async (err, hashedPassword) => {
        if (err) {
          console.log(err);
        } else {
          await prisma.user.update({
            where: { id },
            data: {
              password: hashedPassword,
            },
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

async function createUser(firstName, lastName, username, password) {
  const hashedPassword = bcryptjs.hash(
    password,
    10,
    async (err, hashedPassword) => {
      if (err) {
        console.log(err);
      } else {
        const user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            username,
            password: hashedPassword,
          },
        });
        await prisma.normal.create({ data: { userId: user.id } });
        return user;
      }
    }
  );
}

async function deleteUser(username) {
  try {
    await prisma.user.delete({ where: { username } });
  } catch (err) {
    console.log(err.message);
  }
}

// POST FUNCTIONS
async function getPost(id) {
  try {
    const posts = await prisma.post.findMany({
      where: { id },
      include: {
        likes: true,
        comments: {
          include: {
            user: {
              // You likely want to include the user here for each comment
              select: {
                username: true, // Fetch only the username
              },
            },
          },
        },
      },
    });
    return posts;
  } catch (err) {
    console.log(err.message);
    return err;
  }
}
async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        likes: true,
        comments: {
          include: {
            user: {
              // You likely want to include the user here for each comment
              select: {
                username: true, // Fetch only the username
              },
            },
          },
        },
      },
    });
    return posts;
  } catch (err) {
    console.log(err.message);
    return err;
  }
}
async function createPost(title, content, authorId, description, img) {
  try {
    await prisma.post.create({
      data: {
        title,
        content,
        authorId,
        description,
        img,
      },
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function updatePost(title, content, id, description, img) {
  try {
    await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        description,
        img,
      },
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function deletePost(id) {
  try {
    await prisma.post.delete({
      where: { id },
    });
  } catch (err) {
    console.log(err.message);
  }
}

//COMMENT FUNCTIONS
async function getCommentsByUserId(userId) {
  try {
    const comments = await prisma.comment.findMany({
      where: { userId },
      include: { likes: true },
    });
    return comments;
  } catch (err) {
    console.log(err.message);
    return err;
  }
}
async function getCommentsByUserPostId(postId) {
  try {
    const comments = await prisma.comment.findMany({ where: { postId } });
    return comments;
  } catch (err) {
    console.log(err.message);
    return err;
  }
}

async function createComment(message, postId, userId) {
  try {
    await prisma.comment.create({
      data: {
        message,
        postId,
        userId,
      },
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function updateComment(message, id) {
  try {
    await prisma.comment.update({
      where: { id },
      data: { message },
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function deleteComment(id) {
  try {
    await prisma.comment.delete({
      where: { id },
    });
  } catch (err) {
    console.log(err.message);
  }
}

// LIKES FUNCTIONS

async function getLikesOnComment(commentId) {
  try {
    const likes = await prisma.like.findMany({ where: { commentId } });
    return likes;
  } catch (err) {
    console.log(err.message);
    return err;
  }
}

async function getLikesOnPost(postId) {
  try {
    const likes = await prisma.like.findMany({ where: { postId } });
    return likes;
  } catch (err) {
    console.log(err.message);
    return err;
  }
}

async function getLikesOnPostStatus(userId, postId) {
  try {
    const like = await prisma.like.findFirst({
      where: {
        postId,
        userId, // Ensure both postId and userId match
      },
    });

    if (like) {
      return { liked: true, likeId: like.id }; // Return true and the like ID if a like is found
    } else {
      return { liked: false, likeId: null }; // Return false and null if no like is found
    }
  } catch (err) {
    console.log(err.message);
    return false; // Return false in case of an error (optional)
  }
}

async function createLikeOnComment(userId, commentId) {
  try {
    await prisma.like.create({
      data: {
        commentId,
        userId,
      },
    });
  } catch (err) {
    console.log(err.message);
  }
}
async function createLikeOnPost(userId, postId) {
  try {
    const like = await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });
    return like.id;
  } catch (err) {
    console.log(err.message);
  }
}

async function deleteLike(id) {
  try {
    await prisma.like.delete({
      where: { id },
    });
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = {
  updateUser,
  updateUserPassword,
  createUser,
  deleteUser,
  updatePost,
  createPost,
  getPosts,
  deletePost,
  createComment,
  getCommentsByUserId,
  getCommentsByUserPostId,
  updateComment,
  deleteComment,
  getLikesOnComment,
  getLikesOnPost,
  createLikeOnComment,
  createLikeOnPost,
  deleteLike,
  getLikesOnPostStatus,
  getPost,
};
