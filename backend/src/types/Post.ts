export interface Post {
  id: string;
  title?: string;
  content: string;
  imageUrl?: string;
  scheduledTime?: Date;
  // Add other relevant post properties here
}
