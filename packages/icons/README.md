# @mumukji/icons

Mumukji 디자인 시스템의 아이콘 패키지입니다.

---

## 설치

```bash
pnpm add @mumukji/icons
```

---

## 사용법

### React 컴포넌트

```tsx
import { IconArrowRight, IconFoodKorean } from '@mumukji/icons';

export default function Example() {
  return (
    <>
      <IconArrowRight size={24} />
      <IconFoodKorean size={48} />
    </>
  );
}
```

### 개별 경로 import

```tsx
import { IconArrowRight } from '@mumukji/icons/IconArrowRight';
```

### SVG 직접 사용

```ts
import trashSvg from '@mumukji/icons/trash.svg';
import foodKoreanSvg from '@mumukji/icons/food-korean.svg';
```

### Props

| Prop       | 타입                      | 기본값                | 설명          |
| ---------- | ------------------------- | --------------------- | ------------- |
| `size`     | `number`                  | 일반 `24` / 음식 `48` | 아이콘 크기   |
| `...props` | `SVGProps<SVGSVGElement>` | -                     | SVG 기본 속성 |

> 음식 아이콘(`IconFood*`)은 원본 색상을 유지합니다.
> 일반 아이콘은 `currentColor` 를 사용하므로 `color` 또는 `fill` 로 색상을 지정할 수 있습니다.

---

## 아이콘 목록

추가 예정

---

## 아이콘 추가 방법

```
src/svg/{category}/ 에 SVG 파일 추가
↓
pnpm generate:icons
↓
src/react/ 컴포넌트 생성 및 src/index.ts 자동 업데이트
```

---

## 네이밍 규칙

| SVG 파일                     | 컴포넌트 이름    | dist/svg          |
| ---------------------------- | ---------------- | ----------------- |
| `basic/icon-arrow-right.svg` | `IconArrowRight` | `arrow-right.svg` |
| `basic/icon-star-filled.svg` | `IconStarFilled` | `star-filled.svg` |
| `food/icon-korean.svg`       | `IconFoodKorean` | `food-korean.svg` |

> `basic` 카테고리는 컴포넌트 이름에 카테고리가 포함되지 않습니다.
> `food` 카테고리는 `IconFood*` 형태로 생성됩니다.

---

## 스크립트

| 명령어                | 설명                                       |
| --------------------- | ------------------------------------------ |
| `pnpm generate:icons` | SVG → React 컴포넌트 변환 및 index.ts 생성 |
| `pnpm build`          | 아이콘 생성 후 빌드                        |
| `pnpm clean`          | dist 폴더 제거                             |
