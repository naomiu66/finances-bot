export class CreateExpenseDto {
    readonly amount!: number;
    readonly date!: Date;
    readonly categoryId!: string;
    readonly userId!: string;
    readonly currency?: string;
}