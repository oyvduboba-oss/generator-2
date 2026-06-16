const state = {
  image: null,
  imageLoaded: false,
  caption: "",
  language: "en",
  style: "montessori",
  labelPositionMode: "auto",
  aacCategory: "nouns",
  size: "medium",
};

const SIZE_CONFIG = {
  small: { px: 450, border: 12 },
  medium: { px: 600, border: 16 },
  large: { px: 900, border: 24 },
  class: { px: 1200, border: 32 },
};

const AAC_COLORS = {
  montessori: {
    nouns: "#C9825A",
    verbs: "#8FAF8A",
    describing: "#8DAEC2",
    people: "#E7C96F",
    social: "#C98FA0",
    misc: "#7A746D",
  },
  photo: {
    nouns: "#F28C28",
    verbs: "#2EAD4B",
    describing: "#2F80ED",
    people: "#F2C94C",
    social: "#EB5E9C",
    misc: "#333333",
  },
};

const imageInput = document.getElementById("imageInput");
const captionInput = document.getElementById("captionInput");
const languageSelect = document.getElementById("languageSelect");
const styleSelect = document.getElementById("styleSelect");
const labelPositionSelect = document.getElementById("labelPositionSelect");
const aacCategorySelect = document.getElementById("aacCategorySelect");
const sizeSelect = document.getElementById("sizeSelect");
const exportButton = document.getElementById("exportButton");
const resetButton = document.getElementById("resetButton");
const errorMessage = document.getElementById("errorMessage");

const cardPreview = document.getElementById("cardPreview");
const cardImage = document.getElementById("cardImage");
const imagePlaceholder = document.getElementById("imagePlaceholder");
const cardLabelArea = document.getElementById("cardLabelArea");
const cardLabelText = document.getElementById("cardLabelText");

function showError(message) {
  errorMessage.textContent = message || "";
}

function clearImage() {
  state.image = null;
  state.imageLoaded = false;
  cardImage.src = "";
  cardImage.style.display = "none";
  imagePlaceholder.style.display = "flex";
}

imageInput.addEventListener("change", (event) => {
  showError("");
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showError("Пожалуйста, выберите файл JPG, PNG или WEBP.");
    imageInput.value = "";
    clearImage();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      state.imageLoaded = true;
      cardImage.src = img.src;
      cardImage.style.display = "block";
      imagePlaceholder.style.display = "none";
      updatePreview();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

captionInput.addEventListener("input", (event) => {
  state.caption = event.target.value;
  updatePreview();
});

languageSelect.addEventListener("change", (event) => {
  state.language = event.target.value;
  updatePreview();
});

styleSelect.addEventListener("change", (event) => {
  state.style = event.target.value;
  if (state.labelPositionMode === "auto") {
    autoUpdateLabelPositionClass();
  }
  updatePreview();
});

labelPositionSelect.addEventListener("change", (event) => {
  state.labelPositionMode = event.target.value;
  updatePreview();
});

aacCategorySelect.addEventListener("change", (event) => {
  state.aacCategory = event.target.value;
  updatePreview();
});

sizeSelect.addEventListener("change", (event) => {
  state.size = event.target.value;
  updatePreview();
});

resetButton.addEventListener("click", () => {
  imageInput.value = "";
  captionInput.value = "";
  languageSelect.value = "en";
  styleSelect.value = "montessori";
  labelPositionSelect.value = "auto";
  aacCategorySelect.value = "nouns";
  sizeSelect.value = "medium";

  state.caption = "";
  state.language = "en";
  state.style = "montessori";
  state.labelPositionMode = "auto";
  state.aacCategory = "nouns";
  state.size = "medium";

  clearImage();
  autoUpdateLabelPositionClass();
  updatePreview();
});

exportButton.addEventListener("click", () => {
  showError("");
  try {
    exportToPng();
  } catch (e) {
    console.error(e);
    showError("Не удалось экспортировать PNG. Попробуйте ещё раз.");
  }
});

function autoUpdateLabelPositionClass() {
  cardLabelArea.classList.remove("card-label-area--top", "card-label-area--bottom");
  if (state.style === "montessori") {
    cardLabelArea.classList.add("card-label-area--top");
  } else {
    cardLabelArea.classList.add("card-label-area--bottom");
  }
}

function updatePreview() {
  Object.keys(SIZE_CONFIG).forEach((key) => {
    cardPreview.classList.remove(`card--${key}`);
  });
  cardPreview.classList.add(`card--${state.size}`);

  cardPreview.classList.remove("card--montessori", "card--photo");
  if (state.style === "montessori") {
    cardPreview.classList.add("card--montessori");
  } else {
    cardPreview.classList.add("card--photo");
  }

  const palette = state.style === "montessori" ? AAC_COLORS.montessori : AAC_COLORS.photo;
  const borderColor = palette[state.aacCategory] || palette.nouns;
  cardPreview.style.borderColor = borderColor;

  if (state.labelPositionMode === "auto") {
    autoUpdateLabelPositionClass();
  } else if (state.labelPositionMode === "none") {
    cardLabelArea.style.display = "none";
  } else {
    cardLabelArea.style.display = "flex";
  }

  if (state.labelPositionMode === "none") {
    cardLabelArea.style.display = "none";
  } else {
    cardLabelArea.style.display = "flex";
  }

  cardLabelText.textContent = state.caption;
}

function exportToPng() {
  const config = SIZE_CONFIG[state.size] || SIZE_CONFIG.medium;
  const sizePx = config.px;
  const borderWidth = config.border;
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#F7F0E6";
  ctx.fillRect(0, 0, sizePx, sizePx);

  const palette = state.style === "montessori" ? AAC_COLORS.montessori : AAC_COLORS.photo;
  const borderColor = palette[state.aacCategory] || palette.nouns;

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(
    borderWidth / 2,
    borderWidth / 2,
    sizePx - borderWidth,
    sizePx - borderWidth
  );

  const padding =
    state.size === "small" ? 30 : state.size === "medium" ? 40 : state.size === "large" ? 60 : 80;
  const labelHeight =
    state.size === "small" ? 80 : state.size === "medium" ? 100 : state.size === "large" ? 130 : 170;

  const innerLeft = borderWidth + padding;
  const innerRight = sizePx - borderWidth - padding;
  const innerTop = borderWidth + padding;
  const innerBottom = sizePx - borderWidth - padding;
  const innerWidth = innerRight - innerLeft;
  const innerHeight = innerBottom - innerTop;

  let labelEnabled = state.labelPositionMode !== "none" && state.caption.trim() !== "";
  const labelAtTop =
    labelEnabled &&
    (state.labelPositionMode === "auto"
      ? state.style === "montessori"
      : state.labelPositionMode === "top");

  const labelAreaTop = labelAtTop ? innerTop : innerBottom - labelHeight;
  const imageAreaTop = labelAtTop ? innerTop + (labelEnabled ? labelHeight : 0) : innerTop;
  const imageAreaBottom = labelAtTop
    ? innerBottom
    : innerBottom - (labelEnabled ? labelHeight : 0);

  const imageAreaHeight = imageAreaBottom - imageAreaTop;

  if (state.imageLoaded && state.image) {
    const img = state.image;
    const imgRatio = img.width / img.height;
    const boxRatio = innerWidth / imageAreaHeight;

    let drawWidth;
    let drawHeight;
    if (imgRatio > boxRatio) {
      drawWidth = innerWidth;
      drawHeight = drawWidth / imgRatio;
    } else {
      drawHeight = imageAreaHeight;
      drawWidth = drawHeight * imgRatio;
    }

    const dx = innerLeft + (innerWidth - drawWidth) / 2;
    const dy = imageAreaTop + (imageAreaHeight - drawHeight) / 2;

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = "rgba(63,58,52,0.16)";
    ctx.fillRect(innerLeft, imageAreaTop, innerWidth, imageAreaHeight);
    ctx.fillStyle = "rgba(63,58,52,0.7)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.round(sizePx / 20)}px "Nunito", sans-serif`;
    ctx.fillText("Upload image", sizePx / 2, imageAreaTop + imageAreaHeight / 2);
  }

  if (labelEnabled) {
    ctx.fillStyle = "#3F3A34";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const baseFontSize =
      state.size === "small"
        ? 26
        : state.size === "medium"
        ? 30
        : state.size === "large"
        ? 36
        : 46;

    const text = state.caption.trim();
    const maxWidth = innerWidth * 0.95;

    ctx.font = `${baseFontSize}px "Nunito", sans-serif`;
    let currentFontSize = baseFontSize;
    while (ctx.measureText(text).width > maxWidth && currentFontSize > 14) {
      currentFontSize -= 2;
      ctx.font = `${currentFontSize}px "Nunito", sans-serif`;
    }

    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";
    for (const word of words) {
      const test = currentLine ? currentLine + " " + word : word;
      if (ctx.measureText(test).width <= maxWidth || !currentLine) {
        currentLine = test;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
      if (lines.length === 1 && currentLine && ctx.measureText(currentLine).width > maxWidth) {
        break;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    const finalLines = lines.slice(0, 2);

    const lineHeight = currentFontSize * 1.2;
    const areaCenterY = labelAreaTop + labelHeight / 2;
    const totalTextHeight = lineHeight * finalLines.length;
    const startY = areaCenterY - totalTextHeight / 2 + currentFontSize * 0.1;

    finalLines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.fillText(line, sizePx / 2, y);
    });
  }

  const link = document.createElement("a");
  const sizeLabel =
    state.size === "small"
      ? "450"
      : state.size === "medium"
      ? "600"
      : state.size === "large"
      ? "900"
      : "1200";
  link.download = `pecs-card-${sizeLabel}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

autoUpdateLabelPositionClass();
updatePreview();

