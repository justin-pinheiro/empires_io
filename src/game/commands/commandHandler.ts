import { Player } from '../../models/player.js';
import { Civilisation } from '../../models/civilisation.js';
import { Building } from '../../models/building.js';

import Logger from '../../utils/logger.js';
import type { ICommand } from '../../utils/ICommand.js';

export class CommandHandler {    
    public handleCommand(command: ICommand): { success: boolean; error?: string } {
        const error = command.validate();
        
        if (error) {
            Logger.warn(`Command failed: ${error}`);
            return { success: false, error };
        }

        command.execute();
        return { success: true };
    }
}