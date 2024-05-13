import { Injectable } from '@nestjs/common';
import { Blacklist } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BlacklistService {
    constructor(private prisma: PrismaService) { }

    async createBlacklistItem(name: string): Promise<Blacklist> {
        return this.prisma.blacklist.create({
            data: { name: name },
        })
    }

    async getBlacklistItem(name: string
    ): Promise<Blacklist | null> {
        return this.prisma.blacklist.findUnique({
            where: { name: name },
        });
    }

    async getAllBlacklistItems(): Promise<Blacklist[]> {
        return this.prisma.blacklist.findMany();
    }
}
