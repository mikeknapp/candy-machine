import { valueDidChange } from "./useSubscribe";

type SimpleNumberState = { a: number };

type ComplexState = {
  projects: string[];
  currentProject: {
    name: string;
    tags: string[];
    images: string[];
    currentImage: {
      name: string;
      tags: string[];
    };
  };
};

describe("valueDidChange", () => {
  it("should return true when values are not equal", () => {
    const state1 = { a: 1 };
    const state2 = { a: 2 };
    const selector = "a";
    expect(valueDidChange(selector, state1, state2)).toBe(true);
  });

  it("should return false when values are equal", () => {
    const state1 = { a: 1 };
    const state2 = { a: 1 };
    const selector = "a";
    expect(valueDidChange(selector, state1, state2)).toBe(false);
  });

  it("should return true when one value is null", () => {
    const state1: SimpleNumberState = { a: null };
    const state2 = { a: 1 };
    const selector = "a";
    expect(valueDidChange(selector, state1, state2)).toBe(true);
  });

  it("should return false when both values are null", () => {
    const state1: SimpleNumberState = { a: null };
    const state2: SimpleNumberState = { a: null };
    const selector = "a";
    expect(valueDidChange(selector, state1, state2)).toBe(false);
  });

  it("should return true when both nested elements are the same", () => {
    const state1: ComplexState = {
      projects: ["tesla", "space x", "solar city"],
      currentProject: {
        name: "space x",
        tags: ["rockets", "space", "mars"],
        images: ["rocket1.jpg", "rocket2.jpg", "rocket3.jpg"],
        currentImage: {
          name: "rocket1.jpg",
          tags: ["rocket", "space", "mars"],
        },
      },
    };
    const state2: ComplexState = {
      projects: ["tesla", "space x", "solar city", "hyperloop"],
      currentProject: {
        name: "space x",
        tags: ["rockets", "space", "mars", "planets"],
        images: ["rocket1.jpg", "rocket2.jpg", "rocket3.jpg", "rocket4.jpg"],
        currentImage: {
          name: "rocket4.jpg",
          tags: ["rocket", "space", "mars"],
        },
      },
    };
    const selector = "currentProject.currentImage.tags";
    expect(valueDidChange(selector, state1, state2)).toBe(false);
  });

  it("should return true when a nested element is different", () => {
    const state1: ComplexState = {
      projects: ["tesla", "space x", "solar city"],
      currentProject: {
        name: "space x",
        tags: ["rockets", "space", "mars"],
        images: ["rocket1.jpg", "rocket2.jpg", "rocket3.jpg"],
        currentImage: {
          name: "rocket1.jpg",
          tags: ["rocket", "space", "mars"],
        },
      },
    };
    const state2: ComplexState = {
      projects: ["tesla", "space x", "solar city"],
      currentProject: {
        name: "space x",
        tags: ["rockets", "space", "mars"],
        images: ["rocket1.jpg", "rocket2.jpg", "rocket3.jpg"],
        currentImage: {
          name: "rocket1.jpg ", // extra space
          tags: ["rocket", "space", "mars"],
        },
      },
    };
    const selector = "currentProject.currentImage.name";
    expect(valueDidChange(selector, state1, state2)).toBe(true);
  });
});
