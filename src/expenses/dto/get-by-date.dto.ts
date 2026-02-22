export class GetExpenseByDateDto {
    readonly userId!: string;
    readonly date?: Date;
    readonly take?: number;
    readonly page?: number;  
}