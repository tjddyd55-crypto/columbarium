import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ContractService } from './contract.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateContractDto } from './dto/create-contract.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateContractDto) {
    return this.contractService.createContract(user.id, dto);
  }

  @Get('my')
  async getMy(@CurrentUser() user: { id: string }) {
    return this.contractService.getMyContracts(user.id);
  }

  @Get(':id')
  async getById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.contractService.getContractById(user.id, id);
  }
}
