const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");

const app = express();

// CORSの設定を一貫して適用;
const corsOptions = {
  origin: "http://127.0.0.1:5500",
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.options("/send", cors(corsOptions)); // Preflight対応

// ミドルウェア
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 静的ファイルの提供 (HTMLとCSS)
app.use(express.static("public"));

// ルート
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// お問い合わせのデータを受け取り、メールを送信
app.post("/send", (req, res) => {
  const { name, email, message } = req.body;
  // Nodemailerの設定
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmailを使う場合
    auth: {
      user: process.env.GMAIL_ADDRESS, // 送信元のGmailアドレス
      pass: process.env.GMAIL_PASS, // Gmailのパスワード
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.GMAIL_ADDRESS, // 送信先のメールアドレス
    subject: "お問い合わせフォームからのメッセージ",
    text: `名前: ${name}\nメール: ${email}\nメッセージ:\n${message}`,
  };

  // メールを送信
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .send("エラーが発生しました。メールの送信に失敗しました。");
    } else {
      console.log("メール送信成功: " + info.response);
      res.status(200).send("メールが送信されました！");
    }
  });
});

// サーバーを起動;
app.listen(3000, () => {
  console.log("サーバーがポート3000で起動しました");
});
