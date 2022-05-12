const { application } = require("express");
const express = require("express");
const app = express();
const fs = require("fs");
const matter = require("gray-matter");

function getPosts() {
    const posts = [];
    fs.readdirSync("./pages").forEach((page) => {
        var data = fs.readFileSync("./pages/" + page);
        posts.push({
            slug: page.substring(0, page.length - 3),
            content: data.toString(),
        });
    });
    return posts;
}

function getDate(content) {}

function getSortedPosts() {
    var posts = getPosts();
    return posts.sort((a, b) => {
        var a_gray = matter(a.content);
        var b_gray = matter(b.content);

        var a_date = new Date(a_gray.data.date);
        var b_date = new Date(b_gray.data.date);
        return a_date.getTime() > b_date.getTime() ? -1 : 1;
    });
}

app.get("/", function (req, res) {
    res.status(200).send("Hello World");
});

app.get("/posts", function (req, res) {
    // list all post names
    const posts = [];
    fs.readdirSync("./pages").forEach((post) => {
        posts.push(post.substring(0, post.length - 3));
    });
    res.status(200).json(posts);
    res.end();
});

app.get("/posts/:postId", function (req, res) {
    var file = req.params.postId;
    if (!file) {
        res.status(404).end();
    }
    if (fs.existsSync("./pages/" + file + ".md")) {
        var result = fs.readFileSync("./pages/" + file + ".md");
        res.status(200)
            .set({
                "Content-Type": "text/plain",
            })
            .send(result.toString());
    } else {
        res.status(404).end();
    }
    res.end();
});

app.get("/sorted", (req, res) => {
    // sort by date
    res.status(200).json(getSortedPosts());
});

app.get("/sorted/:page", (req, res) => {
    const posts = getSortedPosts();
    const page = [];
    var pageNumber = req.params.page;
    for (var i = pageNumber * 10; i < (pageNumber + 1) * 10; i++) {
        if (posts[i]) page.push(posts[i]);
    }
    return res.status(200).json(page);
});

app.post("/post", (req, res) => {
    var slug = req.body.slug;
    var content = req.body.content;
    fs.writeFileSync("./pages/" + slug + ".md", content);
    res.status(200).send();
});

app.listen(8080);
