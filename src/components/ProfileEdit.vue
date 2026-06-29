<template>
  <div class="container">
    <HeaderBar />

    <main class="main-content">
      <h2 class="form-title">■顧客情報変更</h2>

      <form class="customer-form" @submit.prevent="save">
        <table class="form-table">
          <tbody>
            <tr>
              <th class="form-label">会社名<span class="required">*</span></th>
              <td class="form-input">
                <input v-model="form.companyName" />
                <p class="error">{{ errors.companyName }}</p>
              </td>

              <th class="form-label">
                会社フリガナ<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.companyKana" />
                <p class="error">{{ errors.companyKana }}</p>
              </td>
            </tr>

            <!-- 担当者 -->
            <tr>
              <th class="form-label">
                担当者名<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.userName" />
                <p class="error">{{ errors.userName }}</p>
              </td>

              <th class="form-label">
                担当者フリガナ<span class="required">*</span>
              </th>
              <td class="form-input">
                <input v-model="form.userKana" />
                <p class="error">{{ errors.userKana }}</p>
              </td>
            </tr>

            <!-- 部署・郵便番号 -->
            <tr>
              <th class="form-label">部署名</th>
              <td class="form-input">
                <input v-model="form.department" />
                <!-- <p class="error">{{ errors.department }}</p> -->
              </td>

              <th class="form-label">
                郵便番号<span class="required">*</span>
              </th>
              <td class="form-input">
                <input type="tel" v-model="form.postalCode" />
                <p class="error">{{ errors.postalCode }}</p>
              </td>
            </tr>

            <!-- 住所（横幅フル） -->
            <tr>
              <th class="form-label">
                会社住所<span class="required">*</span>
              </th>
              <td class="full-width" colspan="3">
                <input v-model="form.address" />
                <p class="error">{{ errors.address }}</p>
              </td>
            </tr>

            <!-- メール・電話 -->
            <tr>
              <th class="form-label">メール<span class="required">*</span></th>
              <td class="form-input">
                <input type="email" v-model="form.email" />
                <p class="error">{{ errors.email }}</p>
              </td>

              <th class="form-label">
                電話番号<span class="required">*</span>
              </th>
              <td class="form-input">
                <input type="tel" v-model="form.phone" />
                <p class="error">{{ errors.phone }}</p>
              </td>
            </tr>

            <!-- パスワード -->
            <tr>
              <th class="form-label">
                パスワード<span class="required">*</span>
              </th>
              <td class="form-input">
                <input type="password" v-model="form.password" />
                <p class="error">{{ errors.password }}</p>
              </td>

              <th class="form-label">確認<span class="required">*</span></th>
              <td class="form-input">
                <input type="password" v-model="form.passwordConfirm" />
                <p class="error">{{ errors.passwordConfirm }}</p>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="form-note">
          <span class="required">*</span
          >項目は必須ですが、変更必要な項目だけを変更してください。
        </p>
        <div class="button-group">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$router.back()"
          >
            戻る
          </button>

          <button class="btn btn-primary" :disabled="isSaving">
            {{ isSaving ? "保存中..." : "保存" }}
          </button>
        </div>
      </form>
    </main>

    <FooterBar />
  </div>
</template>

<script setup>
import { API_BASE } from "@/config/api";
import { reactive, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import HeaderBar from "./HeaderBar.vue";
import FooterBar from "./FooterBar.vue";

const router = useRouter();
const isSaving = ref(false);

const form = reactive({
  companyName: "",
  companyKana: "",
  userName: "",
  userKana: "",
  department: "",
  postalCode: "",
  address: "",
  email: "",
  phone: "",
});

// ✅ 初期値セット
onMounted(() => {
  const data = localStorage.getItem("user");
  // console.log("送信ユーザー", data);
  if (data) {
    const user = JSON.parse(data);
    // console.log("送信ユーザー", user);
    Object.assign(form, user);

    // ✅ パスワード初期値（空）
    form.password = "";
    form.passwordConfirm = "";
  }
});

// ✅ 保存処理
const errors = reactive({});

const save = async () => {
  if (isSaving.value) return; // ✅ 二重防止
  // ✅ エラー初期化
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  let ok = true;

  // ✅ ① 全項目安全化
  Object.keys(form).forEach((key) => {
    form[key] = (form[key] || "").toString().trim();
  });

  // ✅ ② フリガナ変換
  form.companyKana = form.companyKana.replace(/[ぁ-ん]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) + 0x60),
  );

  form.userKana = form.userKana.replace(/[ぁ-ん]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) + 0x60),
  );

  // ✅ ③ 入力整形（画面用）
  form.phone = form.phone.replace(/[^\d-]/g, "");
  form.postalCode = form.postalCode.replace(/[^\d-]/g, "");

  // ✅ ④ 必須チェック
  if (!form.companyName) {
    errors.companyName = "会社名を入力してください";
    ok = false;
  }
  if (!form.companyKana) {
    errors.companyKana = "会社フリガナを入力してください";
    ok = false;
  }
  if (!form.userName) {
    errors.userName = "担当者名を入力してください";
    ok = false;
  }
  if (!form.userKana) {
    errors.userKana = "担当者フリガナを入力してください";
    ok = false;
  }
  if (!form.postalCode) {
    errors.postalCode = "郵便番号を入力してください";
    ok = false;
  }
  if (!form.address) {
    errors.address = "住所を入力してください";
    ok = false;
  }
  if (!form.email) {
    errors.email = "メールを入力してください";
    ok = false;
  }
  if (!form.phone) {
    errors.phone = "電話番号を入力してください";
    ok = false;
  }

  // ✅ フォーマットチェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email && !emailRegex.test(form.email)) {
    errors.email = "メール形式が正しくありません";
    ok = false;
  }

  const phoneClean = form.phone.replace(/-/g, "");
  if (form.phone && !/^0\d{9,10}$/.test(phoneClean)) {
    errors.phone = "電話番号は0から始まる10〜11桁で入力してください";
    ok = false;
  }

  const postalRegex = /^\d{3}-?\d{4}$/;
  if (form.postalCode && !postalRegex.test(form.postalCode)) {
    errors.postalCode = "郵便番号が正しくありません（例: 123-4567,1234567）";
    ok = false;
  }

  const kanaRegex = /^[ァ-ヶー　]+$/;
  if (form.companyKana && !kanaRegex.test(form.companyKana)) {
    errors.companyKana = "全角カタカナで入力してください";
    ok = false;
  }

  if (form.userKana && !kanaRegex.test(form.userKana)) {
    errors.userKana = "全角カタカナで入力してください";
    ok = false;
  }

  const invalidChars = /[<>]/;
  if (invalidChars.test(form.userName)) {
    errors.userName = "使用できない文字が含まれています";
    ok = false;
  }

  // ✅ パスワード（入力時のみ）
  if (form.password) {
    if (!form.passwordConfirm) {
      errors.passwordConfirm = "パスワード確認を入力してください";
      ok = false;
    }

    if (form.password !== form.passwordConfirm) {
      errors.passwordConfirm = "一致していません";
      ok = false;
    }

    const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    if (!passRegex.test(form.password)) {
      errors.password = "英字と数字を含めて6文字以上";
      ok = false;
    }
  }

  if (!ok) return;
  isSaving.value = true; // ✅ ここ追加
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    // console.log(user);

    // ✅ ✅ ✅ ここが今回の追加ポイント🔥
    const dataToSend = { ...form };

    // ✅ ハイフン削除（DB統一）
    dataToSend.phone = (dataToSend.phone || "").replace(/-/g, "");
    dataToSend.postalCode = (dataToSend.postalCode || "").replace(/-/g, "");

    // ✅ パスワード未入力なら削除
    if (!form.password) {
      delete dataToSend.password;
    }

    const res = await fetch(`${API_BASE}/user/${user.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    // ✅ ✅ ✅ ここが修正ポイント🔥
    if (!res.ok) {
      try {
        const data = await res.json();
        alert(data.message || "更新失敗");
      } catch {
        alert("更新失敗");
      }
      return;
    }

    // ✅ ✅ ✅ サーバから取得（重要）
    const updatedUser = await res.json();
    // console.log("最新ユーザー", updatedUser);
    // ✅ localStorage保存（これだけでOK）
    localStorage.setItem("user", JSON.stringify(updatedUser));
    router.push("/profile");
  } catch (err) {
    console.error(err);
    alert("サーバエラー");
  } finally {
    isSaving.value = false; // ✅ 必須
  }
};
</script>
