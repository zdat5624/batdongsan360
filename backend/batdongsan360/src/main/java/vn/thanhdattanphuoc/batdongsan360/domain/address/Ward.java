package vn.thanhdattanphuoc.batdongsan360.domain.address;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "wards")
public class Ward {

    @Id
    private long code;

    private String name;
    private String codename;
    @JsonProperty("division_type")
    private String divisionType;
    @JsonProperty("short_codename")
    private String shortCodename;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    public long getCode() {
        return code;
    }

    public void setCode(long code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCodename() {
        return codename;
    }

    public void setCodename(String codename) {
        this.codename = codename;
    }

    public String getDivisionType() {
        return divisionType;
    }

    public void setDivisionType(String divisionType) {
        this.divisionType = divisionType;
    }

    public String getShortCodename() {
        return shortCodename;
    }

    public void setShortCodename(String shortCodename) {
        this.shortCodename = shortCodename;
    }

    public District getDistrict() {
        return district;
    }

    public void setDistrict(District district) {
        this.district = district;
    }

}
