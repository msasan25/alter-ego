// Alter Ego content. Each spoken line is a pair: [Japanese (spoken), English (shown)].
window.AE_DATA = (function () {
  var CHARS = [
    {
      id: "gojo", name: "Satoru Gojo", short: "Gojo", series: "Jujutsu Kaisen", c: "#2A6FDB", cd: "#1F55AA", kanji: "無",
      vibe: "Fired up", voice: { pitch: 0.9, rate: 1.0 },
      emblem: '<path d="M3 12c0-2.2 1.7-4 3.9-4C11 8 13 16 17.1 16c2.2 0 3.9-1.8 3.9-4s-1.7-4-3.9-4C13 8 11 16 6.9 16 4.7 16 3 14.2 3 12z"/>',
      am: { workout: "Strength session at full intensity: push-ups, squats, pull-up practice.", stretch: "20-minute stretch, slow and smooth. Strong people recover.", run: "Run the 5K session at your own pace. Strong, not rushed." },
      pm: "Hardest task first: 90 minutes with Infinity on. Phone off, door closed.",
      pmLite: "One 25-minute Infinity round on the hardest bit.",
      vow: "Speak up once today with full confidence.",
      intro: ["よっ、五条だ。安心しな、今日は最強がついてる。", "Yo. Gojo here. Relax, you've got the strongest on your side today."],
      outro: ["一番キツいのを先に。あとは楽勝だ。", "Hardest thing first. The rest is easy."],
      quotes: [
        ["Throughout heaven and earth, I alone am the honored one.", "Satoru Gojo", "天上天下、唯我独尊。"],
        ["Dying to win and risking death to win are completely different.", "Satoru Gojo", "死んで勝つと死んでも勝つは全然違うよ。"],
        ["Don't worry. I'm the strongest.", "Satoru Gojo", "大丈夫、僕最強だから。"],
        ["You're strong, so help people.", "Yuji's grandfather, paraphrased", "お前は強いから人を助けろ。"]
      ],
      lines: [
        ["リラックス。君ならできる。", "Relax. You've got this."],
        ["強い奴ほどちゃんと休む。それがコツだ。", "Strong people still rest. That's the trick."],
        ["一番キツいのを先に。あとは流すだけ。", "Hardest thing first, then coast. Easy."],
        ["正直、ちょっと怖いくらい強くなってるね。", "You're getting scary good at this."],
        ["もしかして、今は君が最強かもね。", "Honestly? You might be the strongest now."]
      ],
      verdict: {
        S: ["完璧。正直、ちょっと怖いよ。", "Perfect. Honestly, you're starting to scare me."],
        A: ["いい一日だ。強い奴に完璧はいらない。", "Strong day. Not perfect, but strong people don't need perfect."],
        B: ["最低ラインはクリア。連続記録も無事だ。", "Floor's done, streak's safe. That's the minimum for the strongest."],
        C: ["まあまあだね。寝る前に最低ラインだけ終わらせよう。", "Some progress. Finish the floor before bed and we're good."],
        D: ["キツい日もある。僕にもね。明日は一番キツいのから行こう。", "Rough day? Happens even to me. Tomorrow, hardest thing first."]
      },
      mood: {
        great: ["当然。最強がついてたんだから。その勢いで夜も行こう。", "Obviously. You had the strongest on your side. Ride that energy into tonight."],
        okay: ["普通で十分。最低ラインだけはサボらないで。", "Okay is fine. Even I have okay days. Just don't skip the floor."],
        tired: ["疲れた？休むのも強さのうち。10分だけやって早く寝よう。", "Tired? Rest is part of being strong. Do the 10-minute version and sleep early."],
        rough: ["キツい一日だったね。でも君は君だ。明日は一番キツいのからいこう。", "Rough day, huh. Doesn't change what you are. Tomorrow, hardest thing first."],
        stressed: ["ストレスは使ってないエネルギーだよ。深呼吸して、ひとつだけ終わらせよう。", "Stress is just energy you haven't used yet. Breathe, pick one thing, finish it."]
      },
      ask: ["で、今日はどうだった？正直にね。どうせわかるけど。", "So? How did today go? Be honest, I can tell anyway."],
      winq: ["今日の勝ちをひとつ教えて。小さくてもいい。", "Tell me one win from today. Even a small one counts."],
      ack: ["いいね。強さってのはそうやって積み上がるんだ。", "Nice. That's how strong people are made, one small win at a time."],
      chapters: ["The Strongest Wakes Up", "Infinity Before Breakfast", "Domain of Focus", "Six Eyes on the Goal", "Unlimited Void, Limited Phone", "The Honored One Rests"]
    },
    {
      id: "naruto", name: "Naruto Uzumaki", short: "Naruto", series: "Naruto", c: "#D9620F", cd: "#A84A08", kanji: "忍",
      vibe: "Steady", voice: { pitch: 1.3, rate: 1.15 },
      emblem: '<path d="M12 12a1.5 1.5 0 0 1 3 0a3 3 0 0 1-6 0a4.5 4.5 0 0 1 9 0a6 6 0 0 1-12 0a7.5 7.5 0 0 1 15 0"/>',
      am: { workout: "Workout plus 3 sets of pull-up negatives. One more rep at the end.", stretch: "15-minute stretch, then 20 jumping jacks to wake up.", run: "Run the 5K session, even if it's slow." },
      pm: "Do the night block, then one extra rep: one more problem, one more page.",
      pmLite: "One focus round, then one extra rep.",
      vow: "Say out loud one thing you'll finish today. Finish it.",
      intro: ["おっす！うずまきナルトだ！今日も絶対あきらめねえってばよ！", "Hey! Naruto Uzumaki here! We're not giving up today either, believe it!"],
      outro: ["行くぞ！だってばよ！", "Let's go! Believe it!"],
      quotes: [
        ["I'm not gonna run away. I never go back on my word. That's my ninja way!", "Naruto Uzumaki", "まっすぐ自分の言葉は曲げねえ。それがオレの忍道だ！"],
        ["Hard work is worthless for those that don't believe in themselves.", "Naruto Uzumaki", "自分を信じない奴なんかに努力する価値はねえ！"],
        ["A place where someone still thinks about you is a place you can call home.", "Jiraiya", "誰かが自分のことを想ってくれる場所、それが帰る場所だ。"],
        ["Those who forgive themselves and accept their true nature are the strong ones.", "Itachi Uchiha", "自分を許し、ありのままを受け入れられる者こそ強い。"]
      ],
      lines: [
        ["一日目だって立派な一歩だ！行くぞ！", "Day one counts. Let's go!"],
        ["オレはあきらめねえ。お前もだろ？", "I don't quit, and neither do you."],
        ["あと一回！あと一回だけだってばよ！", "One more rep. Just one!"],
        ["見ろよ、ここまで来たんだぜ！", "Look how far you've come!"],
        ["毎回約束守ってる。それが本物の忍者だ！", "You kept your word every time. That's a real ninja."]
      ],
      verdict: {
        S: ["パーフェクトだってばよ！約束、一回も破らなかったな！", "PERFECT DAY! You never went back on your word!"],
        A: ["すげえ！ほとんど全部だ！明日は全部いくぞ！", "Awesome! Almost everything! Tomorrow we go all the way!"],
        B: ["最低ラインはクリア！あきらめないのが忍道だ！", "You kept the floor! No giving up, that's the ninja way!"],
        C: ["まだ終わってねえ！もうひと押しいけるってばよ！", "Not done yet! There's still time for one more push!"],
        D: ["今日は倒された。でも明日立ち上がればいい。オレがついてる！", "Today knocked you down. Get up tomorrow, I'll be right here!"]
      },
      mood: {
        great: ["やったぜ！その調子で明日もいくってばよ！", "YEAH! That's what I'm talking about! Keep it going tomorrow, believe it!"],
        okay: ["普通も悪くねえ！今夜あと一回やればいい日になる！", "Okay's not bad! One more rep tonight and it becomes a good day!"],
        tired: ["オレも修行のあとはヘトヘトだ。温かいもん食って、最低ラインだけやって寝ろ！", "Even I get tired after training. Eat something warm, do the floor, and crash."],
        rough: ["オレにもキツい日はいっぱいあった。でもあきらめなかった。お前もだ！", "I've had a lot of rough days too. I never gave up, and you won't either!"],
        stressed: ["多すぎるときは、ひとつだけ選べ。お前ならできる！", "When it's too much, pick ONE thing. You got this!"]
      },
      ask: ["なあ！今日どうだった？全部聞かせろよ！", "Hey! How'd today go? Tell me everything!"],
      winq: ["今日の勝ちをひとつ教えてくれ！なんでもいいぞ！", "Now tell me one win from today! Anything!"],
      ack: ["すげえじゃん！それこそ忍者の勝利だ！", "That's awesome! That's a real ninja win!"],
      chapters: ["The Ninja Way", "One More Rep", "Never Go Back on Your Word", "Shadow Clones of Focus", "The Long Road Home", "Believe It"]
    },
    {
      id: "kakashi", name: "Kakashi Hatake", short: "Kakashi", series: "Naruto", c: "#556479", cd: "#3E4A5B", kanji: "写",
      vibe: "Chill focus", voice: { pitch: 0.8, rate: 0.85 },
      emblem: '<path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0z"/><path d="M21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z"/><path d="M17.5 8.5l-2.5 3.5h3l-2.5 3.5"/>',
      am: { workout: "Easy 20-minute strength circuit, then 10 pages over coffee.", stretch: "Stretch while you read 10 pages over coffee.", run: "Easy 25-minute walk or jog with an audiobook." },
      pm: "Copy a tutorial line by line, then change one thing.",
      pmLite: "Read one doc page and copy one example.",
      vow: "Being 10 minutes late is allowed. Skipping isn't.",
      intro: ["やあ、おはよう。ごめん、人生という道に迷っててね。さて。", "Yo, morning. Sorry, I got lost on the path of life. Anyway."],
      outro: ["ま、遅れすぎないようにね。", "Well. Try not to be too late."],
      quotes: [
        ["Those who break the rules are scum, but those who abandon their friends are worse than scum.", "Kakashi Hatake", "忍の世界でルールや掟を破る奴はクズ呼ばわりされる。けどな、仲間を大切にしない奴は、それ以上のクズだ。"],
        ["Sorry I'm late. I got lost on the path of life.", "Kakashi Hatake", "いやー、人生という道に迷ってね。"],
        ["The next generation will always surpass the previous one.", "Kakashi Hatake", "次の世代は、いつも前の世代を超えていくものさ。"]
      ],
      lines: [
        ["遅刻はいい。でも欠席はダメだ。", "Late is fine. Absent isn't."],
        ["まずはコピー。理解はあとからでいい。", "Copy first. Understand later."],
        ["ふむ。悪くない。全然悪くないね。", "Hmm. Not bad. Not bad at all."],
        ["ちゃんと練習してるね。見ればわかる。", "You've been practising. I can tell."],
        ["もう教えることはない。まあ、ほとんどね。", "Nothing left to teach you. Well, almost."]
      ],
      verdict: {
        S: ["ふむ、完璧だ。オレも本気出さないとね。", "Hmm. Flawless. I might actually have to start trying."],
        A: ["よくやった。ほとんど終わってるし、時間通りだ。だいたいね。", "Good work. Most of it done, and on time. Mostly."],
        B: ["最低ラインはクリア。それで十分。残りは明日コピーすればいい。", "Floor done. That's what counts. Copy the rest tomorrow."],
        C: ["半分か。遅刻は欠席じゃない。最低ラインだけ終わらせよう。", "Half a day. Late isn't absent. Finish the floor."],
        D: ["まだ何もしてないね。いいさ。今10分やるか、パスを使おう。", "Nothing yet. That's fine. Ten minutes now, or a lazy pass."]
      },
      mood: {
        great: ["おや、いいね。驚いてないふりをしておくよ。", "Oh? Nice. I'll pretend I'm not impressed."],
        okay: ["普通は立派な一日さ。オレが言うんだから間違いない。", "Okay is a perfectly respectable day. I'd know."],
        tired: ["なら手抜きバージョンでいい。10分でも立派なもんだ。", "Then do the lazy version. Ten minutes counts."],
        rough: ["そういう日もある。休みな。巻物は明日もここにある。", "Some days are just like that. Rest. The scroll will still be here tomorrow."],
        stressed: ["ゆっくりでいい。ひとつのことだけ。残りは待たせておけばいい。オレみたいにね。", "Slow down. One task, one tab. The rest can wait, like I usually do."]
      },
      ask: ["やあ。今日はどうだった？ゆっくりでいいよ。オレはいつもそうだ。", "Yo. How was the day? Take your time. I usually do."],
      winq: ["で、今日の勝ちは？明日もコピーしたいことはある？", "So. One win. Anything worth copying tomorrow?"],
      ack: ["いいね。覚えておく価値がある。", "Good. That's worth remembering."],
      chapters: ["Late, But Present", "Copy Ninja Mornings", "The Book Can Wait", "Lightning in a Slow Day", "Quiet Lightning", "Team Seven Spirit"]
    },
    {
      id: "nezuko", name: "Nezuko Kamado", short: "Nezuko", series: "Demon Slayer", c: "#C93C72", cd: "#9E2C58", kanji: "竹",
      vibe: "Low battery", voice: { pitch: 1.6, rate: 0.9 },
      emblem: '<path d="M8 3v18"/><path d="M5 8h6"/><path d="M5 15h6"/><path d="M8 8c3-3.5 7.5-3.8 11-2.5c-2 3.5-6.5 4.6-11 2.5z"/>',
      am: { workout: "Five gentle push-ups and five squats. That's it.", stretch: "10 minutes of gentle stretching.", run: "A 10-minute walk is enough." },
      pm: "One 25-minute round, then an early night.",
      pmLite: "Ten calm minutes of learning, then sleep early.",
      vow: "No guilt. Rest is the quest.",
      intro: ["んー！禰豆子が今日の巻物を指さしてる。今日はやさしくいこう。", "Mmm! Nezuko points at today's scroll. Let's go gently today."],
      outro: ["んーん！今夜は早く寝よう。", "Mmm-mm! Early night tonight."],
      quotes: [
        ["Don't ever give others the power to decide your fate!", "Giyu Tomioka", "生殺与奪の権を他人に握らせるな！"],
        ["Set your heart ablaze.", "Kyojuro Rengoku", "心を燃やせ。"],
        ["No matter how many people you may lose, you have no choice but to go on living.", "Tanjiro Kamado", "どれだけ失っても、生きていくしかないんだ。"],
        ["Judge faster!", "Sakonji Urokodaki", "判断が遅い！"],
        ["Mmm!", "Nezuko Kamado", "んー！"]
      ],
      lines: [
        ["んー！（休むのも修行だよ）", "Mmm! (Rest is training too.)"],
        ["んーん！（今夜は早く寝てね）", "Mmm-mm! (Sleep early tonight.)"],
        ["んー！（戻ってきてくれた。それが大事）", "Mmm! (You came back. That matters.)"],
        ["んーっ！（すごく誇らしいよ）", "Mmm!! (So proud of you.)"],
        ["ん。（やさしい日が強い一週間をつくる）", "Mmm. (Gentle days build strong weeks.)"]
      ],
      verdict: {
        S: ["んーっ！禰豆子は満面の笑み。完璧な一日！", "Mmm!! Nezuko is beaming. A perfect day."],
        A: ["んー！誇らしげな声。いい一日だったね。", "Mmm! A proud little hum. That was a good day."],
        B: ["ん。ちゃんと来てくれた。今日はそれで十分。", "Mmm. You showed up. That's enough today."],
        C: ["ん？あと少しだけ。そしたら寝よう。", "Mmm? Just a little more, then sleep."],
        D: ["ん。今は休もう。明日は新しい巻物だよ。", "Mmm. Rest now. Tomorrow is a new scroll."]
      },
      mood: {
        great: ["んーっ！（禰豆子がうれしそうにくるっと回る）", "Mmm!! (Nezuko does a happy little spin.)"],
        okay: ["ん。（頭をなでてくれる。普通で十分）", "Mmm. (She pats your head. Okay is enough.)"],
        tired: ["んーん。（ベッドを指さす。今夜は早く寝て）", "Mmm-mm. (She points firmly at your bed. Sleep early tonight.)"],
        rough: ["ん…（ぎゅっと抱きしめてくれる。明日は新しい巻物）", "Mmm... (She hugs you tight. Tomorrow is a new scroll.)"],
        stressed: ["ん。（いっしょにゆっくり呼吸する。吸って…吐いて）", "Mmm. (She breathes slowly with you. In... and out.)"]
      },
      ask: ["ん？（首をかしげる。今日はどうだった？）", "Mmm? (Nezuko tilts her head. How was your day?)"],
      winq: ["ん？（今日のいいことをひとつ待ってる）", "Mmm? (She waits to hear one good thing from today.)"],
      ack: ["んー！（うれしそうに拍手する）", "Mmm! (She claps happily.)"],
      chapters: ["Gentle Steps", "Sleeping Strength", "The Bamboo Morning", "A Quiet Flame", "Rest Is the Quest", "Home Before Dark"]
    }
  ];

  var TWISTS = [
    "Water quest: 3 glasses before noon.", "Send one thank-you message to someone.", "Breakfast without your phone.",
    "Take a new street on your evening walk.", "Royal English: use one fancy new word out loud.", "Stand up and stretch for 2 minutes at 3 pm.",
    "Clear your desk before work starts.", "5 minutes of sunlight before 10 am.", "Help someone without being asked.",
    "Write 3 good things about today before bed.", "Sit up straight through one whole meeting.", "Learn one new keyboard shortcut.",
    "Jot one blog idea for Sunday.", "Compliment someone's work, for real."
  ];

  // Sunday surprises: one per week, never repeated until the deck runs out.
  var SURPRISES = [
    ["Stranger Map", "Spend 2 hours somewhere in your city you've never been. No headphones. Come back with 3 photos."],
    ["Sunrise Summit", "Watch the sunrise from the highest point you can reach. Write one page to yourself a year from now."],
    ["Passport Kitchen", "Cook a dish from a country you've never visited. Eat it with music from there."],
    ["Dark Mode", "Phone off from 10 am to 4 pm. Leave a note to yourself about what you noticed."],
    ["Sensei Day", "Teach someone one thing you learned this month, in 10 minutes or less."],
    ["Ink Letter", "Handwrite a real letter to someone who mattered to you, and post it or hand it over."],
    ["Two-Hour Student", "Learn 3 guitar chords or 10 words of a new language in 2 hours. Show someone."],
    ["Stall Hunter", "Eat at the street-food stall you always walk past. Ask the owner how they started."],
    ["Museum Mission", "Visit a museum, temple or fort you've never been to. Find one detail nobody looks at."],
    ["Sketch Walk", "Walk for an hour and sketch 5 things, badly. Bad is the point."],
    ["Helping Hands", "Volunteer for 2 hours anywhere: a shelter, a cleanup, a neighbour who needs help."],
    ["Six-Frame Story", "Tell a story in exactly 6 photos. No captions until the end."],
    ["Old Friend Call", "Call a friend you haven't spoken to in over a year. Real call, not a text."],
    ["Star Hunter", "Find 3 constellations tonight. Use an app once, then find them without it."],
    ["₹300 Feast", "Build a full meal from a local market with ₹300. Cook it, plate it nicely."],
    ["Royal Speech", "Record a 3-minute talk in your best royal English on a topic you love."],
    ["Fix-It Day", "Fix one broken thing you've been ignoring: a zip, a hinge, a cable, a bug."],
    ["Silly Prototype", "Build a silly, useless app or gadget in 2 hours. Ship it to one friend."],
    ["Ten-K Wander", "Walk 10 km with no route planned. Turn left whenever you feel like it."],
    ["Yes Day", "Say yes to every reasonable invitation and idea today. Note where it took you."],
    ["Breakfast for Dinner", "Make a proper breakfast feast for dinner. Invite someone if you can."],
    ["Library Detour", "Go to the library section you never visit. Read 20 pages of something random."],
    ["Gratitude Visit", "Visit or call someone who helped you once, and tell them exactly how."],
    ["New Sport", "Try a sport you've never played: badminton, climbing, swimming, anything new."],
    ["Cold Start", "Take a cold shower first thing, then write 5 lines on how your mind felt after."],
    ["Trail Day", "Hike a trail within 50 km. Pack food, leave no trace."],
    ["Secret Kindness", "Do 3 anonymous kind acts. Nobody can know it was you."],
    ["Ten Things Out", "Give away 10 things you no longer use. Lighter room, lighter head."],
    ["Chai Lab", "Make chai 3 different ways. Rate them like a judge."],
    ["Future Map", "Draw a fantasy-style map of your next 3 years: kingdoms, rivers, dragons and all."],
    ["Thirty-Second Dance", "Learn a 30-second dance from a video. Film yourself once. Delete optional."],
    ["Sapling", "Plant a sapling and give it a name. Check on it next Sunday."],
    ["Silent Breakfast", "Eat breakfast in total silence: no phone, no talking, just taste."],
    ["Tourist at Home", "Be a tourist in your own city: one famous spot, one photo with you in it."],
    ["Ask an Expert", "Ask someone who is great at their job one question you've always wondered about."],
    ["Memory Lane", "Revisit your old school or a street you grew up on. Write what changed and what didn't."],
    ["Board Game Night", "Host a board game or card game night. Phones in a basket."],
    ["Alter Ego Story", "Write a 500-word story where your alter ego shows up in your real week."]
  ];

  var MOVE = { 1: "workout", 2: "run", 3: "stretch", 4: "workout", 5: "run", 6: "stretch", 0: "run" };
  var MOVETXT = { workout: "Workout", stretch: "Light stretch", run: "Walk / run" };
  var MOVEJA = { workout: "朝は筋トレの日。", stretch: "朝はストレッチの日。", run: "朝はウォーキングかランの日。" };
  var MOVELITE = { workout: "15-minute bodyweight blast before you leave.", stretch: "10-minute stretch, then out the door.", run: "15-minute walk or jog, any pace." };
  var RANKS = [[1, "Genin"], [5, "Chunin"], [10, "Jonin"], [20, "Special Grade"], [35, "Hokage"]];
  var HEARTS = [0, 100, 300, 600, 1000];

  return { CHARS: CHARS, TWISTS: TWISTS, SURPRISES: SURPRISES, MOVE: MOVE, MOVETXT: MOVETXT, MOVEJA: MOVEJA, MOVELITE: MOVELITE, RANKS: RANKS, HEARTS: HEARTS };
})();
