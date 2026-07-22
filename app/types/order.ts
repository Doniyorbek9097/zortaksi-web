export interface IOwner {
    userId: string;
    firstName: string;
    username?: string;
    phone?: string;
    sessionName?: string;
}

export interface ISenderAccessHash {
    ownerId: string;
    accessHash: string;
}

export interface ISender {
    userId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isBot: boolean;
    accessHashes?: ISenderAccessHash[];
}

export interface IGroup {
    groupId: string;
    title: string;
    username?: string;
    type: 'group' | 'supergroup' | 'channel';
    membersCount?: number;
}

export interface IMessage {
    messageId: number;
    text: string;
    date: string | Date;
    hasMedia: boolean;
    mediaType?: 'photo' | 'video' | 'document' | 'none';
    replyToMessageId?: number;
    rawEntities?: any[];
}

export interface IOrder {
    _id?: string;
    owner: IOwner;
    sender: ISender;
    group: IGroup;
    message: IMessage;
    status: 'new' | 'processing' | 'confirmed' | 'cancelled' | 'completed';
    createdAt: string | Date;
    updatedAt: string | Date;
}
