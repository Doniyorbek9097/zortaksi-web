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
    avatar?: string;
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

export interface IBookedByUser {
    userId: string;
    firstName?: string;
    lastName?: string;
    username?: string;
}

export interface IInterestedUser {
    userId: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
    name?: string;
}

export interface IOrder {
    _id?: string;
    owner: IOwner;
    sender: ISender;
    group: IGroup;
    message: IMessage;
    status: 'new' | 'booked' | 'processing' | 'confirmed' | 'cancelled' | 'completed';
    bookedBy?: string | null;
    bookedAt?: string | Date | null;
    bookedByUser?: IBookedByUser | null;
    bookPrice?: number;
    /** Qo'ng'iroq raqami (server: xabar matni → sender.phone) */
    callPhone?: string | null;
    /** Xabar/Telefon bosganlar soni */
    interestCount?: number;
    interestedUsers?: IInterestedUser[];
    /** Admin: admin userbot creator guruhi — guruhdan ban */
    canRestrictSender?: boolean;
    dedupeKey?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}
