const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const verify = require("../verify");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err)
  }
});

//update a post
router.put("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.user.id) {
      await post.updateOne({ $set: req.body })
      res.status(200).json("Post has been updated")
    } else {
      res.status(403).json("You can update only your posts!");
    }
  } catch (err) {
    res.status(500).json(err)
  }
});

//delete a post
router.delete("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.user.id || req.user.isAdmin) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("u can delete only your posts!");
    }
  } catch (err) {
    console.log(err)
   return res.status(500).json(err);
  }

}); 
 
//like or dislike a post
router.put("/:id/like", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      await post.updateOne({ $push: { likes: req.user.id } });
      res.status(200).json("the post has been liked:")
    } else {
      await post.updateOne({ $pull: { likes: req.user.id } });
     res.status(200).json("the post has been disliked");
    }
  } catch (err) {
    console.log(err)
   return res.status(500).json(err)
  }
});

//add comment
router.put("/:id/comment", verify, async (req, res) => {
  const { value } = req.body
  const { id } = req.params
  try {
    const post = await Post.findById(id);
    post.comments.push(value);
    const uptadetPost = await Post.findByIdAndUpdate(id, post, { new: true });
    res.status(200).json(uptadetPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/:id", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const userPosts = await Post.find({ userId: currentUser._id });

    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get users all post
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const userPosts = await Post.find({ userId: user._id });
    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;