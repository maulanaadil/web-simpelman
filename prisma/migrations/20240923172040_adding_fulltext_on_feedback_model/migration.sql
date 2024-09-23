-- CreateIndex
CREATE FULLTEXT INDEX `Feedback_email_content_idx` ON `Feedback`(`email`, `content`);
