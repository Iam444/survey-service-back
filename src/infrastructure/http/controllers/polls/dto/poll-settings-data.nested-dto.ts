import {
    Equals,
    IsUUID,
    ArrayUnique,
    IsArray,
    IsNotEmpty,
    IsEnum,
    IsBoolean,
    ValidateNested,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PollStatisticsAccessTypesEnum } from '$components/survey-service/domain/poll/poll-statistics-access-types.enum.js';
import { PollStatisticsDisplayFormatsEnum } from '$components/survey-service/domain/poll/poll-statistics-display-formats.enum.js';
import { PollAccessTypesEnum } from '$components/survey-service/domain/poll/poll-access-types.enum.js';
import type {
    IPollNonSpecifiedAccessSettingsDataDTO,
    IPollStatisticsSpecifiedAccessSettingsDataDTO,
    IPollStatisticsNonSpecifiedAccessSettingsDataDTO,
    IPollEnabledStatisticsSettingsDataDTO,
    IPollSpecifiedAccessSettingsDataDTO,
    IPollSettingsDataDTO,
    IPollDisabledStatisticsSettingsDataDTO,
} from '$components/survey-service/domain/poll/factories/poll-settings-data.dto.interface.js';

export class PollSpecifiedUsersAccessSettingsDataNestedDTO implements IPollSpecifiedAccessSettingsDataDTO {
    @Equals(PollAccessTypesEnum.SPECIFIED, { message: 'Тип доступа должен быть строго SPECIFIED' })
    public readonly type!: typeof PollAccessTypesEnum.SPECIFIED;

    @IsUUID('4', { each: true, message: 'Каждый идентификатор должен быть валидным UUID v4' })
    @ArrayUnique({ message: 'Идентификаторы пользователей не должны повторяться' })
    @IsArray({ message: 'Список идентификаторов должен быть массивом' })
    @IsNotEmpty({ message: 'Список пользователей не должен быть пустым при ограниченном доступе' })
    public readonly holderIds!: string[];
}

export class PollNonSpecifiedAccessSettingsDataNestedDTO implements IPollNonSpecifiedAccessSettingsDataDTO {
    @IsEnum([PollAccessTypesEnum.PUBLIC, PollAccessTypesEnum.REGISTERED], {
        message: 'Некорректный тип доступа',
    })
    public readonly type!: typeof PollAccessTypesEnum.PUBLIC | typeof PollAccessTypesEnum.REGISTERED;
}

export class PollStatisticsSpecifiedAccessSettingsDataNestedDTO implements IPollStatisticsSpecifiedAccessSettingsDataDTO {
    @Equals(PollStatisticsAccessTypesEnum.SPECIFIED, {
        message: 'Тип доступа к статистике должен быть "specified_users"',
    })
    public readonly type!: typeof PollStatisticsAccessTypesEnum.SPECIFIED;

    @IsUUID('4', { each: true, message: 'Каждый идентификатор должен быть валидным UUID v4' })
    @ArrayUnique({ message: 'Идентификаторы пользователей не должны повторяться' })
    @IsArray({ message: 'Список идентификаторов должен быть массивом' })
    @IsNotEmpty({ message: 'Список пользователей не должен быть пустым при ограниченном доступе' })
    public readonly holderIds!: string[];
}

export class PollStatisticsNonSpecifiedAccessSettingsDataNestedDTO implements IPollStatisticsNonSpecifiedAccessSettingsDataDTO {
    @IsEnum([PollStatisticsAccessTypesEnum.PUBLIC, PollStatisticsAccessTypesEnum.PRIVATE], {
        message: 'Некорректный тип доступа к статистике',
    })
    public readonly type!: typeof PollStatisticsAccessTypesEnum.PUBLIC | typeof PollStatisticsAccessTypesEnum.PRIVATE;
}

export class PollEnabledStatisticsSettingsDataNestedDTO implements IPollEnabledStatisticsSettingsDataDTO {
    @IsEnum([PollStatisticsDisplayFormatsEnum.PARTIAL, PollStatisticsDisplayFormatsEnum.FULL], {
        message: 'Некорректный формат отображения статистики',
    })
    public readonly displayFormat!:
        typeof PollStatisticsDisplayFormatsEnum.PARTIAL | typeof PollStatisticsDisplayFormatsEnum.FULL;

    @ValidateNested()
    @Type(() => Object, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: [
                {
                    value: PollStatisticsSpecifiedAccessSettingsDataNestedDTO,
                    name: PollStatisticsAccessTypesEnum.SPECIFIED,
                },
                {
                    value: PollStatisticsNonSpecifiedAccessSettingsDataNestedDTO,
                    name: PollStatisticsAccessTypesEnum.PUBLIC,
                },
                {
                    value: PollStatisticsNonSpecifiedAccessSettingsDataNestedDTO,
                    name: PollStatisticsAccessTypesEnum.PRIVATE,
                },
            ],
        },
    })
    public readonly accessSettings!:
        PollStatisticsSpecifiedAccessSettingsDataNestedDTO | PollStatisticsNonSpecifiedAccessSettingsDataNestedDTO;

    @IsBoolean({ message: 'Флаг отображения статистики после голосования должен быть boolean' })
    public readonly shouldShowAfterVoting!: boolean;
}

export class PollDisabledStatisticsSettingsDataNestedDTO implements IPollDisabledStatisticsSettingsDataDTO {
    @Equals(PollStatisticsDisplayFormatsEnum.NONE, { message: 'Формат отображения должен быть "none"' })
    public readonly displayFormat!: typeof PollStatisticsDisplayFormatsEnum.NONE;
}

export class PollSettingsDataNestedDTO implements IPollSettingsDataDTO {
    @IsBoolean({ message: 'Флаг мультивыбора должен быть boolean' })
    public readonly isMultiChoiceEnabled!: boolean;

    @ValidateNested()
    @IsObject({ message: 'Настройки доступа должны быть объектом' })
    @Type(() => Object, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: [
                { value: PollSpecifiedUsersAccessSettingsDataNestedDTO, name: PollAccessTypesEnum.SPECIFIED },
                { value: PollNonSpecifiedAccessSettingsDataNestedDTO, name: PollAccessTypesEnum.PUBLIC },
                { value: PollNonSpecifiedAccessSettingsDataNestedDTO, name: PollAccessTypesEnum.REGISTERED },
            ],
        },
    })
    public readonly accessSettings!:
        PollSpecifiedUsersAccessSettingsDataNestedDTO | PollNonSpecifiedAccessSettingsDataNestedDTO;

    @ValidateNested()
    @IsObject({ message: 'Настройки статистики должны быть объектом' })
    @Type(() => Object, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'displayFormat',
            subTypes: [
                { value: PollEnabledStatisticsSettingsDataNestedDTO, name: PollStatisticsDisplayFormatsEnum.FULL },
                { value: PollEnabledStatisticsSettingsDataNestedDTO, name: PollStatisticsDisplayFormatsEnum.PARTIAL },
                { value: PollDisabledStatisticsSettingsDataNestedDTO, name: PollStatisticsDisplayFormatsEnum.NONE },
            ],
        },
    })
    public readonly statisticsSettings!:
        PollEnabledStatisticsSettingsDataNestedDTO | PollDisabledStatisticsSettingsDataNestedDTO;
}
