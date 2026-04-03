import type { BossState } from "../../../types";
import { detectLanguage } from "./language";

// ─── Message Database ──────────────────────────────────────────────

const MESSAGES: Record<string, Record<BossState, string[]>> = {
  en: {
    chill: [
      "Not bad, not bad... Senpai is almost impressed. Almost.",
      "Look at you, coding like a good little junior. Senpai approves.",
      "Clean code? In THIS repo? Senpai might shed a tear.",
      "Keep this up and senpai might let you leave on time today.",
      "Hmph. Acceptable. Senpai has seen worse. Much worse.",
      "You're on thin ice, but at least it's frozen solid. Good.",
      "Senpai nods silently. That's the highest praise you'll get.",
      "The code... it's not terrible. Senpai is confused by this feeling.",
    ],
    annoyed: [
      "Oh, it's fine. Senpai only reviewed this 47 times already. Go ahead, {trigger}.",
      "No no, please continue. Senpai loves watching you {trigger}. Really.",
      "Interesting choice to {trigger}. Bold. Stupid, but bold.",
      "Senpai is not mad. Just disappointed. Very, very disappointed.",
      "You know what, {trigger} is fine. Everything is fine. This is fine.",
      "Senpai's eye is twitching. That's never a good sign for you.",
      "*Senpai slowly removes glasses* ...did you just {trigger}?",
      "Ah yes, {trigger}. A classic move. Senpai remembers the last person who did that. They don't work here anymore.",
    ],
    angry: [
      "OI OI OI! Did you just {trigger}?! Senpai's blood pressure can't take this!",
      "You absolute menace. {trigger}?! In THIS economy?!",
      "NANI?! You dare {trigger}?! Senpai trained you better than this!",
      "{trigger}?! That's it. Senpai is calling HR. And your mother.",
      "Senpai has seen war. Senpai has seen bugs in production. But {trigger}?! THIS IS WORSE.",
      "The audacity. The SHEER audacity to {trigger}. Senpai is shaking.",
      "Every day senpai wakes up and chooses patience. Today you made that impossible by choosing to {trigger}.",
      "You {trigger} and expect senpai to stay calm?! SENPAI IS NOT CALM.",
    ],
    insane: [
      "OMAE WA MOU SHINDEIRU... and so is this codebase. You {trigger}. There is no forgiveness.",
      "THIS IS THE END! {trigger}?! Senpai is flipping the table. EVERYTHING BURNS.",
      "YOU {trigger}?! SENPAI QUIT. SENPAI IS DONE. *flips desk* *breaks keyboard* *uninstalls git*",
      "In 20 years of coding, senpai has never... NEVER... seen someone {trigger} with such confidence. The NERVE.",
      "ALERT: SENPAI RAGE LEVEL CRITICAL. {trigger} detected. All systems failing. Dignity lost.",
      "That's it. That's the last straw. You {trigger} and now senpai must destroy everything. EVERYTHING.",
      "*DRAMATIC ANIME SCREAM* {trigger}?!?!?! THE BETRAYAL! THE ABSOLUTE BETRAYAL!",
      "Senpai's final form has been activated. You {trigger}. Now face the consequences. @#$%!",
    ],
  },
  vi: {
    chill: [
      "Được đấy... Senpai gần như ấn tượng. Gần như thôi.",
      "Nhìn em code ngoan thế này senpai thấy cuộc đời vẫn còn ý nghĩa.",
      "Code sạch? Ở cái repo NÀY? Senpai muốn khóc.",
      "Cứ thế này thì senpai cho em về đúng giờ hôm nay.",
      "Hmph. Chấp nhận được. Senpai đã thấy tệ hơn nhiều. Rất nhiều.",
      "Em đang trên băng mỏng, nhưng ít ra nó còn đóng chắc. Tốt.",
      "Senpai gật đầu im lặng. Đó là lời khen cao nhất em sẽ nhận được.",
      "Code... nó không tệ. Senpai đang bối rối vì cảm giác này.",
    ],
    annoyed: [
      "Không sao đâu em. Senpai chỉ review 47 lần thôi mà. Cứ {trigger} đi.",
      "Em cứ tiếp tục đi. Senpai quen rồi. Quen lắm rồi.",
      "Lựa chọn thú vị khi {trigger}. Táo bạo. Ngu, nhưng táo bạo.",
      "Senpai không giận. Chỉ thất vọng. Rất, rất thất vọng.",
      "Ừ thì {trigger} cũng được. Mọi thứ đều ổn. Ổn hết.",
      "Mắt senpai đang giật. Đó không bao giờ là dấu hiệu tốt cho em.",
      "*Senpai từ từ tháo kính* ...em vừa {trigger} thật hả?",
      "À đúng rồi, {trigger}. Nước đi kinh điển. Senpai nhớ người cuối cùng làm vậy. Họ không còn làm ở đây nữa.",
    ],
    angry: [
      "Ê Ê Ê! Em vừa {trigger} hả?! Huyết áp senpai lên 180 rồi đó!",
      "Trời ơi em. {trigger}?! Senpai nuôi em bao năm để được ngày hôm nay hả?!",
      "NANI?! Em dám {trigger}?! Senpai dạy em tốt hơn thế này mà!",
      "{trigger}?! Thôi xong. Senpai gọi HR. Và gọi luôn mẹ em.",
      "Senpai đã thấy chiến tranh. Senpai đã thấy bug production. Nhưng {trigger}?! CÁI NÀY TỆ HƠN.",
      "Sự trơ trẽn. Sự TRƠN TRẼ TUYỆT ĐỐI khi {trigger}. Senpai đang run.",
      "Mỗi ngày senpai thức dậy và chọn kiên nhẫn. Hôm nay em làm điều đó bất khả thi khi chọn {trigger}.",
      "Em {trigger} và mong senpai bình tĩnh?! SENPAI KHÔNG BÌNH TĨNH.",
    ],
    insane: [
      "OMAE WA MOU SHINDEIRU... code của em cũng vậy. Em vừa {trigger}. Không có sự tha thứ.",
      "THẾ LÀ HẾT! {trigger}?! Senpai lật bàn. LẬT HẾT. CHÁY HẾT.",
      "EM {trigger}?! SENPAI NGHỈ. SENPAI DONE. *lật bàn* *bẻ bàn phím* *uninstall git*",
      "20 năm code, senpai chưa bao giờ... CHƯA BAO GIỜ... thấy ai {trigger} tự tin đến vậy. Sự LIỀU LĨNH.",
      "CẢNH BÁO: ĐỘ GIẬN SENPAI NGUY HIỂM. {trigger} detected. Mọi hệ thống sụp đổ.",
      "Thế là xong. Giọt nước tràn ly. Em {trigger} và giờ senpai phải huỷ diệt hết. HẾT.",
      "*TIẾNG HÉT ANIME KỊCH TÍNH* {trigger}?!?!?! SỰ PHẢN BỘI! SỰ PHẢN BỘI TUYỆT ĐỐI!",
      "Final form của senpai đã kích hoạt. Em {trigger}. Giờ hãy đối mặt hậu quả. @#$%!",
    ],
  },
};

const TRIGGER_DESCRIPTIONS: Record<string, Record<string, string>> = {
  en: {
    code_errors: "write code with errors",
    forgot_build: "commit without building",
    forgot_test: "push without testing",
    push_main: "push directly to main",
    file_too_long: "write an endless file",
    no_commit_too_long: "code for hours without committing",
    tiny_commit: "commit just a couple lines of changes",
    too_many_commits_rapid: "keep committing without pushing",
    too_many_commits_push: "dump a mountain of commits in one push",
  },
  vi: {
    code_errors: "viết code có lỗi",
    forgot_build: "commit mà không build",
    forgot_test: "push mà không test",
    push_main: "push thẳng lên main",
    file_too_long: "viết file dài vô tận",
    no_commit_too_long: "code hàng giờ mà không commit",
    tiny_commit: "commit có mỗi vài dòng thay đổi",
    too_many_commits_rapid: "commit liên tục mà không chịu push",
    too_many_commits_push: "gom cả đống commits vào 1 push",
  },
};

export function getMessage(bossState: BossState, triggerType: string): string {
  const lang = detectLanguage();
  const messages = MESSAGES[lang]?.[bossState] ?? MESSAGES.en[bossState];
  const randomIndex = Math.floor(Math.random() * messages.length);
  const template = messages[randomIndex];

  const desc = TRIGGER_DESCRIPTIONS[lang]?.[triggerType]
    ?? TRIGGER_DESCRIPTIONS.en[triggerType]
    ?? triggerType;

  return template.replace(/\{trigger\}/g, desc);
}
