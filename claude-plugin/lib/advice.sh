#!/bin/bash
# Toxic Senpai - Detailed Advice per Trigger

get_advice() {
  local trigger="$1"
  local lang="$2"

  if [ "$lang" = "vi" ]; then
    get_advice_vi "$trigger"
  else
    get_advice_en "$trigger"
  fi
}

get_advice_en() {
  local trigger="$1"
  case "$trigger" in
    too_many_commits)
      cat <<'ADVICE'
WHY SENPAI IS MAD:
  You've made 6+ commits without pushing. That means your
  code is piling up locally with no review or backup.

WHAT TO DO:
  - Push after every few commits (2-3 is ideal)
  - Your teammates can't see or review what you don't push
  - If your branch breaks remote, better to find out early
  - Run: git push origin $(git branch --show-current)

SENPAI SAYS:
  "Push early, push often. Don't hoard commits like a dragon."
ADVICE
      ;;
    forgot_build)
      cat <<'ADVICE'
WHY SENPAI IS MAD:
  You committed without building first. Your code might not
  even compile, and now that's in the git history forever.

WHAT TO DO:
  Always build before committing:
    npm run build && git commit -m "your message"

  Or set up a pre-commit hook to auto-build:
    npx husky add .husky/pre-commit "npm run build"

SENPAI SAYS:
  "Trust, but verify. Build, then commit."
ADVICE
      ;;
    forgot_test)
      cat <<'ADVICE'
WHY SENPAI IS MAD:
  You pushed code without running tests. If tests fail on
  the remote, you'll block the whole team.

WHAT TO DO:
  Always test before pushing:
    npm test && git push

  Or set up a pre-push hook:
    npx husky add .husky/pre-push "npm test"

SENPAI SAYS:
  "Untested code is guilty until proven innocent."
ADVICE
      ;;
    push_main)
      cat <<'ADVICE'
WHY SENPAI IS MAD:
  You pushed directly to main/master. This bypasses code review,
  CI checks, and puts untested code in production.

WHAT TO DO:
  1. Create a feature branch:
     git checkout -b feat/your-feature

  2. Push the branch:
     git push origin feat/your-feature

  3. Create a Pull Request for review

  4. Merge after approval + CI passes

  Consider protecting main branch on GitHub:
    Settings → Branches → Add rule → Require PR reviews

SENPAI SAYS:
  "Main branch is sacred ground. You don't walk in with dirty shoes."
ADVICE
      ;;
    file_too_long)
      cat <<'ADVICE'
WHY SENPAI IS MAD:
  This file is getting too long. Long files are hard to read,
  hard to maintain, and a sign that it's doing too much.

WHAT TO DO:
  - Split into smaller, focused modules
  - Extract helper functions into separate files
  - If it's a component, break it into sub-components
  - Aim for files under 300-500 lines

SENPAI SAYS:
  "A file should do one thing well, not everything badly."
ADVICE
      ;;
    no_commit_too_long)
      cat <<'ADVICE'
WHY SENPAI IS MAD:
  You've been coding for hours without committing. If something
  goes wrong, you'll lose all that work.

WHAT TO DO:
  - Commit early, commit often
  - Make small, atomic commits (one logical change per commit)
  - Use "git stash" if you need to switch context
  - Aim for at least one commit every 30-60 minutes

SENPAI SAYS:
  "Commit like your laptop battery could die any second."
ADVICE
      ;;
    code_errors)
      cat <<'ADVICE'
WHY SENPAI IS MAD:
  Your code has errors. Fix them before moving on, or they'll
  pile up and become harder to track down.

WHAT TO DO:
  - Read the error message carefully
  - Fix errors before writing new code
  - Run your linter: npm run lint
  - Check types: npm run check-types

SENPAI SAYS:
  "An error today is a production incident tomorrow."
ADVICE
      ;;
    *)
      echo "Senpai is watching. Code carefully."
      ;;
  esac
}

get_advice_vi() {
  local trigger="$1"
  case "$trigger" in
    too_many_commits)
      cat <<'ADVICE'
TẠI SAO SENPAI GIẬN:
  Em đã commit 6+ lần mà không push. Code đang chất đống
  ở local, không ai review hay backup được.

NÊN LÀM:
  - Push sau mỗi 2-3 commits
  - Đồng đội không thấy được code em không push
  - Nếu branch bị lỗi trên remote, phát hiện sớm hơn
  - Chạy: git push origin $(git branch --show-current)

SENPAI NÓI:
  "Push sớm, push thường. Đừng tích trữ commits như rồng giữ vàng."
ADVICE
      ;;
    forgot_build)
      cat <<'ADVICE'
TẠI SAO SENPAI GIẬN:
  Em commit mà không build trước. Code có khi còn không compile
  được, mà đã nằm trong git history mãi mãi rồi.

NÊN LÀM:
  Luôn build trước khi commit:
    npm run build && git commit -m "message"

  Hoặc setup pre-commit hook tự động build:
    npx husky add .husky/pre-commit "npm run build"

SENPAI NÓI:
  "Tin tưởng nhưng phải kiểm chứng. Build rồi hãy commit."
ADVICE
      ;;
    forgot_test)
      cat <<'ADVICE'
TẠI SAO SENPAI GIẬN:
  Em push code mà không chạy test. Nếu test fail trên remote,
  em sẽ block cả team.

NÊN LÀM:
  Luôn test trước khi push:
    npm test && git push

  Hoặc setup pre-push hook:
    npx husky add .husky/pre-push "npm test"

SENPAI NÓI:
  "Code chưa test là có tội cho đến khi được chứng minh vô tội."
ADVICE
      ;;
    push_main)
      cat <<'ADVICE'
TẠI SAO SENPAI GIẬN:
  Em push thẳng lên main/master. Như vậy là bỏ qua code review,
  CI checks, và đưa code chưa test lên production.

NÊN LÀM:
  1. Tạo feature branch:
     git checkout -b feat/ten-feature

  2. Push branch:
     git push origin feat/ten-feature

  3. Tạo Pull Request để review

  4. Merge sau khi được approve + CI pass

  Nên protect main branch trên GitHub:
    Settings → Branches → Add rule → Require PR reviews

SENPAI NÓI:
  "Main branch là đất thánh. Không ai được bước vào với giày bẩn."
ADVICE
      ;;
    file_too_long)
      cat <<'ADVICE'
TẠI SAO SENPAI GIẬN:
  File này dài quá. File dài khó đọc, khó maintain, và là dấu
  hiệu nó đang làm quá nhiều thứ.

NÊN LÀM:
  - Tách thành modules nhỏ hơn, tập trung
  - Extract helper functions ra file riêng
  - Nếu là component, chia thành sub-components
  - Target dưới 300-500 dòng

SENPAI NÓI:
  "Một file nên làm tốt một việc, không phải làm tệ mọi việc."
ADVICE
      ;;
    no_commit_too_long)
      cat <<'ADVICE'
TẠI SAO SENPAI GIẬN:
  Em code mấy tiếng rồi mà không commit. Nếu có gì sai,
  em sẽ mất hết công sức.

NÊN LÀM:
  - Commit sớm, commit thường xuyên
  - Mỗi commit là một thay đổi logic (atomic commits)
  - Dùng "git stash" nếu cần chuyển context
  - Ít nhất mỗi 30-60 phút nên commit một lần

SENPAI NÓI:
  "Commit như thể pin laptop có thể chết bất cứ lúc nào."
ADVICE
      ;;
    code_errors)
      cat <<'ADVICE'
TẠI SAO SENPAI GIẬN:
  Code của em có lỗi. Sửa chúng trước khi viết tiếp, nếu không
  chúng sẽ chồng chất và khó trace hơn.

NÊN LÀM:
  - Đọc kỹ error message
  - Sửa errors trước khi viết code mới
  - Chạy linter: npm run lint
  - Check types: npm run check-types

SENPAI NÓI:
  "Lỗi hôm nay là incident production ngày mai."
ADVICE
      ;;
    *)
      echo "Senpai đang theo dõi. Code cẩn thận nhé."
      ;;
  esac
}
