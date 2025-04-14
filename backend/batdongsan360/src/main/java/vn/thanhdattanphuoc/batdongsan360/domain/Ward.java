package vn.thanhdattanphuoc.batdongsan360.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "wards")
public class Ward {

    @Id
    private long code;

    private String name;
    @JsonIgnore
    private String codename;
    @JsonProperty("division_type")
    private String divisionType;
    @JsonProperty("short_codename")
    @JsonIgnore
    private String shortCodename;

    @OneToMany(mappedBy = "ward")
    @JsonIgnore
    private List<Post> post;

    @ManyToOne
    @JoinColumn(name = "district_code")
    @JsonIgnore
    private District district;

    public long getCode() {
        return code;
    }

    public List<Post> getPost() {
        return post;
    }

    public void setPost(List<Post> post) {
        this.post = post;
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
