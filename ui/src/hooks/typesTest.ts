import { ExtractProperties, ExtractProperty, Path } from "./types";

// Type Tests

interface Image {
  name: string;
  tags: string[];
}

interface Project {
  name: string;
  isLoading: boolean;
  images: Image[];
}

interface AppData {
  isError: boolean;
  isLoading: boolean;
  project: Project;
  projects: Project[];
}

// Test for Path
type TestPath = Path<AppData>;
type ExpectedPath =
  | "isError"
  | "isLoading"
  | "projects"
  | `projects[${number}]`
  | `projects[${number}].isLoading`
  | `projects[${number}].images`
  | `projects[${number}].name`
  | `projects[${number}].images[${number}]`
  | `projects[${number}].images[${number}].name`
  | `projects[${number}].images[${number}].tags`
  | `projects[${number}].images[${number}].tags[${number}]`
  | "project"
  | "project.name"
  | "project.isLoading"
  | "project.images"
  | `project.images[${number}]`
  | `project.images[${number}].name`
  | `project.images[${number}].tags`
  | `project.images[${number}].tags[${number}]`;
type AssertPath = TestPath extends ExpectedPath ? true : false;
const assertPath: AssertPath = true as true;

type Test1 = ExtractProperty<AppData, "project.name">;
type Expected1 = { project: { name: string } };
type Test1Result = Test1 extends Expected1 ? true : false;
const assertTest1: Test1Result = true as true;

type Test2 = ExtractProperty<AppData, "projects[0].name">;
type Expected2 = { projects: { name: string }[] };
type Test2Result = Test2 extends Expected2 ? true : false;
const assertTest2: Test2Result = true as true;

type Test3 = ExtractProperty<AppData, "project.images[0].name">;
type Expected3 = { project: { images: { name: string }[] } };
type Test3Result = Test3 extends Expected3 ? true : false;
const assertTest3: Test3Result = true as true;

type Test4 = ExtractProperties<
  AppData,
  ["project.name", "projects[0].name", "projects[0].isLoading"]
>;
type Expected4 = {
  project: { name: string };
  projects: { name: string }[] & { isLoading: boolean }[];
};
type Test4Result = Test4 extends Expected4 ? true : false;
const assertTest4: Test4Result = true as true;

function testFunction<P extends Path<AppData>[]>(
  selectors: P = [] as P,
): ExtractProperties<AppData, P> {
  return {
    project: {
      name: "project name",
    },
  } as unknown as ExtractProperties<AppData, P>;
}

const test1 = testFunction<["project.name"]>();
const test2 = testFunction<["projects[0].name"]>();
const test3 = testFunction<["project.images[0].name"]>();
