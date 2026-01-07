import { useEffect, useState } from "react";
import { getPosts, createPost, addComment } from "../api/bazikalka";

export default function Bazikalka() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [text, setText] = useState("");

  
  useEffect(() => {
    setLoading(true);
    getPosts()
      .then((data) => {
        console.log("📥 Отримані пости з бекенду:", data);
        setPosts(data);
      })
      .catch((e) => {
        console.error("❌ Помилка отримання постів:", e);
        setErr(e?.response?.data?.error || e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  
  const onCreate = async () => {
    if (!text.trim()) return;
    try {
      const temp = {
        _id: "tmp_" + Date.now(),
        author: "Михайло",
        text,
        createdAt: new Date().toISOString(),
        comments: []
      };
      setPosts((p) => [temp, ...p]);
      setText("");
      const saved = await createPost({ author: "Михайло", text });
      setPosts((p) => [saved, ...p.filter((x) => x._id !== temp._id)]);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  
  const onAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      const updated = await addComment(postId, {
        author: "Іван",
        text: commentText
      });
      setPosts((p) => p.map((x) => (x._id === postId ? updated : x)));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  
  if (loading) return <div>Завантаження…</div>;
  if (err) return <div style={{ color: "crimson" }}>Помилка: {err}</div>;

  return (
    <div style={{ maxWidth: 720, margin: "20px auto", padding: 16 }}>
      <h2>Базікалка</h2>

      {}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напиши пост…"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={onCreate}>Додати</button>
      </div>

      {}
      {posts.map((post) => (
        <article
          key={post._id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12
          }}
        >
          <div style={{ fontWeight: 600 }}>{post.author}</div>
          <div style={{ margin: "6px 0" }}>{post.text}</div>
          <small>{new Date(post.createdAt).toLocaleString()}</small>

          <Comments post={post} onSubmit={(t) => onAddComment(post._id, t)} />
        </article>
      ))}
    </div>
  );
}

function Comments({ post, onSubmit }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Коментар…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit(val);
              setVal("");
            }
          }}
          style={{ flex: 1, padding: 6 }}
        />
        <button
          onClick={() => {
            onSubmit(val);
            setVal("");
          }}
        >
          Надіслати
        </button>
      </div>
      {post.comments?.length > 0 && (
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {post.comments.map((c, i) => (
            <li key={c._id || i}>
              <b>{c.author}:</b> {c.text}{" "}
              <small>({new Date(c.createdAt).toLocaleString()})</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
