## v2 Product Requirements Document (PRD)

### Product Overview

Candy Machine v2 is a comprehensive, next-generation web-based application built with Next.js, Tailwind CSS, and SQLite. It enables efficient image dataset tagging, editing, and management tailored for custom Stable Diffusion and DreamBooth model training workflows, optimized for OneTrainer.

### Features

#### Project Creation

- Users can create new, named projects to organize images.
- Each project stores its images and metadata separately in a structured SQLite database and corresponding filesystem directory (`/data/<project_slug>/`).
- Users should be able to copy images between projects easily.

#### Image Upload & Processing

- Supports drag-and-drop functionality and file picker for image uploads.
- Real-time file upload progress popup appears in the bottom right corner for feedback.
- Upon upload, images undergo automated processing:
  - Extraction of basic image metadata (i.e. image dimensions, file size).
  - Storage of originals as `<file_id>-original.<ext>` using the original file format. (Exported images are stored as `<file_id>-export.png`).
  - Auto cropping to a recommended aspect ratio and image size for optimal training results. The crop can be manually adjusted if desired.
  - Hashing of image data for duplicate detection and efficient search; optional vector embedding creation for semantic similarity search.
  - Automatic tagging via configurable VLLM (e.g., local or OpenAI-compatible) with attributes like location, lighting, and pose.
  - Automatic image segmentation to generate editable masks. (Stored as `<file_id>-masklabel.png`)

#### Persistent Task Queue

- Background task queue with persistence (e.g., SQLite-based).
- Supports asynchronous processing of computationally intensive tasks (image conversion, hashing, embedding, tagging, and segmentation) to ensure optimal UI responsiveness.
- Provides visibility into ongoing task status, completion, and error handling.

#### Image Rating & Selection

- Users rate images quickly for coarse categorization.
- The first pass of ratings could be done by an VLLM.
- Implements pairwise comparisons to derive fine-grained Elo ratings, allowing for precise filtering (e.g., "hide images with Elo score below 950").
- UI-driven sorting and filtering options for intuitive dataset refinement.

#### Image Editing & Management

- Manual upscaling / restoration of images. (Stored as `<file_id>-restored.png`)
- Built-in image editor with features:
  - Rotation and cropping (rotation and crops stored in the database, and then exported to `<file_id>-export.png`). This means the user can rotate and crop the image as much as they want in the future, without having to worry about losing any data.
  - Mask editing capabilities (brush-based). Multiple masks can be applied to the same image, and then combined when exporting.
  - Editable and customizable tagging system.
- Instant visual feedback and persistent state tracking via SQLite.

#### Project Statistics

- Image counts by rating
- Image counts by tag
- Image counts by aspect ratio (need to ensure this is divisible by your training batch count)

#### Data Export

- Flexible export options including:
  - Image subsets filtered by tags (e.g., "sunny").
  - Export of images as `.png`, masks as `.png`, and tags as `.txt` files.
  - Compatibility-focused format (e.g., structured directories) for easy integration with training platforms like OneTrainer.

### Technical Stack

- **Frontend:** Next.js (latest), TypeScript, Tailwind CSS (v14, note there is no config file for v14), shadcn UI components
- **Backend:** Next.js server functions, SQLite (via `prisma`)
- **Task Queue:** `node-persistent-queue` for persistent task management
- **Image Processing:** `sharp` for image processing
- **ML Integration:** OpenAI-compatible VLLM (local or remote)
- **File Management:** Local filesystem storage structured for efficiency
- **State Management:** Jotai for state management

### User Interface Considerations

- Responsive, clean, and minimalistic UI.
- Keyboard shortcuts for enhanced productivity.
- Clearly visualized statuses for uploads, processing queues, and data exports.

### Performance & Scalability

- Optimized for datasets of up to ~1,000 images per project.
- Efficient task queue implementation to ensure responsive UI even during intensive batch processing.

### Security & Privacy

- Entirely local processing with no third-party data transmission.
- SQLite-based storage encrypted as optional enhancement.

### Future Roadmap

- Enhanced semantic image search capabilities.
- Advanced analytics dashboard for model training insights.
- Integration with cloud-based training platforms for streamlined workflows.
