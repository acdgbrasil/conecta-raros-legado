import { NotificationEntity, NotificationSchema, NotificationStatus } from "../entity/Notification.entity";


export class Notification {
  constructor(private props: NotificationEntity) {}

  static create(props: Omit<NotificationEntity, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'sentAt'>): Notification {
    const validProps = NotificationSchema.parse({
      ...props,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: props.metadata || {}
    });

    return new Notification(validProps);
  }

  static restore(props: NotificationEntity): Notification {
    return new Notification(props);
  }

  public markAsSent(providerResponse?: any): void {
    if (this.props.status === NotificationStatus.SENT) {
        return;
    }

    this.props.status = NotificationStatus.SENT;
    this.props.sentAt = new Date();
    this.props.updatedAt = new Date();

    if (providerResponse) {
      this.props.metadata = {
        ...this.props.metadata,
        providerResponse
      };
    }
  }

  public markAsFailed(error: any): void {
    this.props.status = NotificationStatus.FAILED;
    this.props.updatedAt = new Date();
    
    this.props.metadata = {
      ...this.props.metadata,
      error: {
        message: error.message || 'Unknown error',
        stack: error.stack,
        timestamp: new Date()
      }
    };
  }

  public isProcessed(): boolean {
    return this.props.status !== NotificationStatus.PENDING;
  }

  get id() { return this.props.id; }
  get recipient() { return this.props.recipient; }
  get subject() { return this.props.subject; }
  get content() { return this.props.content; }
  get channel() { return this.props.channel; }
  get status() { return this.props.status; }


}