export const TASK_TITLE_MAX_LENGTH = 300;
export const TASK_DESCRIPTION_MAX_LENGTH = 8000;

export function truncateTaskTitle(title: string) {
  return title.slice(0, TASK_TITLE_MAX_LENGTH);
}
